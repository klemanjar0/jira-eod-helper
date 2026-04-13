export interface UserSettings {
  user_id: string;
  project_id: string;
  issue_query: string;
  content_template: string;
  ticket_item_template: string;
  mail_recipient: string;
  mail_subject: string;
  mail_author: string;
  assignee: string;
  username: string;
  is_using_master_key: boolean;
  created_at: string;
  updated_at: string;
  api_key: string;
  assignee_is_current_user: boolean;
}
