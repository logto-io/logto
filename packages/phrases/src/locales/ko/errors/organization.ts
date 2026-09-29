const organization = {
  require_membership: '사용자는 조직의 구성원이어야 합니다.',
  role_names_not_found:
    '유효하지 않은 역할 이름이 감지되었습니다: {{names,list(type:conjunction)}}. 계속하기 전에 먼저 이 역할들을 생성해 주세요.',
  invitation_status_not_changeable: '초대 상태는 더 이상 변경할 수 없습니다.',
  accepted_user_id_required: '초대를 수락하려면 `acceptedUserId`가 필요합니다.',
  invitee_already_member: '초대받은 사용자는 이미 조직의 구성원입니다.',
  accepted_user_email_mismatch:
    '수락하는 사용자는 초대받은 사용자와 동일한 이메일을 가져야 합니다.',
  expires_at_in_future: '`expiresAt` 값은 미래여야 합니다.',
};

export default Object.freeze(organization);
