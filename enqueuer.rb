# frozen_string_literal: true

class OutreachV2::DraftMessages::Enqueuer
  attr_reader :draft_message, :mailbox, :in_reply_to,
              :user, :updated_profile_ids

  def initialize(draft_message)
    @draft_message = draft_message
    @mailbox = draft_message.mailbox
    @in_reply_to = draft_message.in_reply_to
    @user = @mailbox.user
    @updated_profile_ids = []
  end

  def call
    raise 'No profiles found' if draft_message.profiles.blank?

    ApplicationRecord.transaction do
      draft_message.profiles.each do |profile|
        updated_profile_ids << profile.id
        enqueue(profile)
      end
      draft_message.unbind_attachments
      draft_message.destroy!
    end
    broadcast
  end

  private

  def enqueue(profile)
    subject = build_subject(profile)
    html = build_html(profile)
    text = build_text(html)

    dialog = if in_reply_to
               in_reply_to.dialog
             else
               mailbox.dialogs.create!(
                 profile: profile,
                 subject: subject
               )
             end

    message = dialog.messages.create!(
      cc: draft_message.cc,
      bcc: draft_message.bcc,
      subject: subject,
      html: add_in_reply_to_html(html),
      text: text,
      outgoing_status: :queued
    )
    bind_attachments(message)
    update_last_message_relation(profile, message)
  end

  def build_subject(profile)
    apply_variables(draft_message.subject, profile)
  end

  def build_html(profile)
    html = apply_variables(draft_message.html, profile)
    add_signature(html)
  end

  def build_text(html)
    strip_tags(html)
  end

  def apply_variables(text, profile)
    Outreach::TemplateVariablesApplier.new(text, profile, user).call
  end

  def strip_tags(text)
    ActionController::Base.helpers.strip_tags(text)
  end

  def add_signature(html)
    return html if !mailbox.show_signature || mailbox.signature.blank?

    html + "<br>#{mailbox.signature}"
  end

  def add_in_reply_to_html(html)
    return html unless in_reply_to

    <<~HTML
      #{html}
      <div>
        <br class="">
        <blockquote type="cite" class="">
          <div class="">
            #{in_reply_to.html}
          </div>
        </blockquote>
      </div>
      <br class="">
    HTML
  end

  def bind_attachments(message)
    return if draft_message.attachments.blank?

    message.attachments = draft_message.attachments.to_a
  end

  def update_last_message_relation(profile, message)
    last_message_relation = OutreachV2::LastMessageRelation.find_or_initialize_by(
      user: user,
      profile: profile
    )
    last_message_relation.message_id = message.id
    last_message_relation.save!
  end

  def broadcast
    OutreachV2::ContactsChannel.update(user, profile_ids: updated_profile_ids)
  end
end
