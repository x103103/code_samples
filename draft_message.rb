# frozen_string_literal: true

class OutreachV2::DraftMessage < ApplicationRecord
  enum status: { draft: 0, queued: 1, scheduled: 2 }

  belongs_to :user, inverse_of: :outreach_v2_draft_messages
  belongs_to :mailbox,
             class_name: 'OutreachV2::Mailbox',
             optional: true,
             inverse_of: :draft_messages
  belongs_to :in_reply_to,
             class_name: 'OutreachV2::Message',
             optional: true,
             inverse_of: :draft_messages
  has_many :attachments,
           class_name: 'OutreachV2::Attachment',
           foreign_key: :draft_message_id,
           inverse_of: :draft_message,
           dependent: :delete_all
  has_and_belongs_to_many :profiles,
                          -> { order(:email) },
                          class_name: 'Influencers::Profile',
                          join_table: 'outreach_v2_draft_messages_profiles',
                          foreign_key: :message_id,
                          association_foreign_key: :profile_id

  def unbind_attachments
    attachments.update_all(draft_message_id: nil)
  end

  def small_text(length = 50)
    text = ActionController::Base.helpers.strip_tags(html)
    text&.truncate(length, separator: ' ')
  end
end

# == Schema Information
#
# Table name: outreach_v2_draft_messages
#
#  id             :uuid             not null, primary key
#  bcc            :string           is an Array
#  cc             :string           is an Array
#  html           :string
#  references     :string           default([]), is an Array
#  scheduled_for  :datetime
#  status         :integer          default("draft"), not null
#  subject        :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  in_reply_to_id :uuid
#  mailbox_id     :uuid
#  user_id        :uuid             not null
#
# Indexes
#
#  index_outreach_v2_draft_messages_on_mailbox_id     (mailbox_id)
#  index_outreach_v2_draft_messages_on_scheduled_for  (scheduled_for)
#  index_outreach_v2_draft_messages_on_user_id        (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (in_reply_to_id => outreach_v2_messages.id)
#  fk_rails_...  (mailbox_id => outreach_v2_mailboxes.id) ON DELETE => nullify
#  fk_rails_...  (user_id => users.id)
#
