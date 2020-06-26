# frozen_string_literal: true

require 'rails_helper'

describe OutreachV2::DraftMessages::Enqueuer do
  it 'should create 2 dialogs' do
    profile1 = create(:influencers_profile)
    profile2 = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile1, profile2])
    expect { described_class.new(draft_message).call }
      .to change { OutreachV2::Dialog.count }.by(2)
  end

  it 'should create 2 messages' do
    profile1 = create(:influencers_profile)
    profile2 = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile1, profile2])
    expect { described_class.new(draft_message).call }
      .to change { OutreachV2::Message.where(outgoing_status: :queued).count }.by(2)
  end

  it 'should update last message relation' do
    profile1 = create(:influencers_profile)
    profile2 = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile1, profile2])
    user = draft_message.user

    described_class.new(draft_message).call

    expect(OutreachV2::LastMessageRelation.where(user: user, profile: profile1).exists?)
      .to be_truthy
    expect(OutreachV2::LastMessageRelation.where(user: user, profile: profile2).exists?)
      .to be_truthy
  end

  it 'should rebind attachments from draft to messages' do
    profile = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile])
    attachment = create(:outreach_v2_attachment, draft_message: draft_message)
    expect { described_class.new(draft_message).call }
      .to change { draft_message.attachments.exists?(attachment.id) }.from(true).to(false)
    expect(OutreachV2::Message.first.attachments.exists?(attachment.id)).to eq(true)
  end

  it 'should delete draft message' do
    profile = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile])
    expect { described_class.new(draft_message).call }
      .to change { OutreachV2::DraftMessage.exists?(draft_message.id) }.from(true).to(false)
  end

  it 'should broadcast update event' do
    profile = create(:influencers_profile)
    draft_message = create(:outreach_v2_draft_message, profiles: [profile])
    user = draft_message.user
    expect(OutreachV2::ContactsChannel)
      .to receive(:update).with(user, profile_ids: [profile.id])

    described_class.new(draft_message).call
  end

  it 'should add signature' do
    profile = create(:influencers_profile)
    mailbox = create(:outreach_v2_mailbox, :signature_with_base64_images)
    draft_message = create(:outreach_v2_draft_message,
                           mailbox: mailbox,
                           profiles: [profile])

    described_class.new(draft_message).call

    message = OutreachV2::Message.first
    expect(message.html).to include('signature text')
  end

  context 'when this is reply message' do
    it 'should add in reply to message to html' do
      profile = create(:influencers_profile)
      in_reply_to_message = create(:outreach_v2_message, :income)
      mailbox = in_reply_to_message.dialog.mailbox
      user = mailbox.user
      draft_message = create(:outreach_v2_draft_message,
                             in_reply_to: in_reply_to_message,
                             mailbox: mailbox,
                             user: user,
                             profiles: [profile])

      described_class.new(draft_message).call

      message = OutreachV2::Message.order(created_at: :desc).first
      expect(message.html).to include('<blockquote type="cite" class="">')
      expect(message.html).to include(in_reply_to_message.text)
    end

    it 'should add message to in reply to message dialog' do
      profile = create(:influencers_profile)
      in_reply_to_message = create(:outreach_v2_message, :income)
      dialog = in_reply_to_message.dialog
      mailbox = dialog.mailbox
      user = mailbox.user
      draft_message = create(:outreach_v2_draft_message,
                             in_reply_to: in_reply_to_message,
                             mailbox: mailbox,
                             user: user,
                             profiles: [profile])

      expect { described_class.new(draft_message).call }
        .to change { dialog.messages.count }.by(1)
    end
  end
end
