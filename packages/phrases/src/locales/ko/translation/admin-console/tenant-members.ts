const tenant_members = {
  members: '멤버',
  invitations: '초대',
  invite_members: '멤버 초대',
  user: '사용자',
  roles: '역할',
  admin: '관리자',
  collaborator: '협력자',
  invitation_status: '초대 상태',
  inviter: '초대자',
  expiration_date: '만료 날짜',
  invite_modal: {
    title: 'Silverhand로 사람 초대',
    subtitle: '조직에 멤버를 초대하려면 초대를 수락해야 합니다.',
    to: '받는 사람',
    added_as: '역할로 추가됨',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: '보류 중',
    accepted: '수락함',
    expired: '만료됨',
    revoked: '철회됨',
  },
  invitation_empty_placeholder: {
    title: '팀 멤버 초대',
    description:
      '귀하의 테넌트에는 현재 초대받은 멤버가 없습니다.\n통합에 도움을 주려면 더 많은 멤버나 관리자를 추가하세요.',
  },
  menu_options: {
    edit: '테넌트 역할 편집',
    delete: '테넌트에서 사용자 제거',
    resend_invite: '초대 다시 보내기',
    revoke: '초대 철회',
    delete_invitation_record: '이 초대 기록 삭제',
  },
  edit_modal: {
    title: '{{name}}의 역할 변경',
  },
  delete_user_confirm: '이 사용자를 이 테넌트에서 제거하시겠습니까?',
  assign_admin_confirm:
    '선택한 사용자를 관리자로 지정하시겠습니까? 관리자 액세스 부여시 다음 권한이 부여됩니다.<ul><li>테넌트 요금제 변경</li><li>협력자 추가 또는 제거</li><li>테넌트 삭제</li></ul>',
  revoke_invitation_confirm: '이 초대를 철회하시겠습니까?',
  delete_invitation_confirm: '이 초대 기록을 삭제하시겠습니까?',
  messages: {
    invitation_sent: '초대가 전송되었습니다.',
    invitation_revoked: '초대가 철회되었습니다.',
    invitation_resend: '초대가 다시 전송되었습니다.',
    invitation_deleted: '초대 기록이 삭제되었습니다.',
  },
  errors: {
    email_required: '초대 받는 사람 이메일은 필수입니다.',
    email_exists: '이메일 주소가 이미 존재합니다.',
    member_exists: '이 사용자는 이미 이 조직의 멤버입니다.',
    pending_invitation_exists:
      '보류 중인 초대가 있습니다. 관련 이메일을 삭제하거나 초대를 철회하세요.',
    invalid_email: '이메일 주소가 잘못되었습니다. 올바른 형식인지 확인하세요.',
    max_member_limit: '이 테넌트의 최대 멤버 수({{limit}}명)에 도달했습니다.',
  },
};

export default Object.freeze(tenant_members);
