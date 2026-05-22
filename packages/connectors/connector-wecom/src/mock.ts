export const mockedConfig = {
  corpId: '<corp-id>',
  appSecret: '<app-secret>',
  agentId: '<agent-id>',
  access_token: 'access_token',
};

export const mockedUserDetailByUserIdResponse = {
  errcode: 0,
  errmsg: 'ok',
  userid: 'zhangsan',
  name: '张三',
  alias: 'jackzhang',
  department: [1, 2],
  main_department: 1,
  telephone: '4001234567',
  is_leader_in_dept: [1, 0],
  direct_leader: ['lisi'],
  order: [1],
  position: '后台工程师',
  external_position: '产品经理',
  external_profile: {
    foo: 'bar',
  },
  extattr: {
    foo: 'bar',
  },
};

export const mockedUserDetailByUserTicketResponse = {
  errcode: 0,
  errmsg: 'ok',
  userid: 'zhangsan',
  gender: '1',
  avatar: 'http://shp.qpic.cn/bizmp/xxxxxxxxxxx/0',
  qr_code: 'https://open.work.weixin.qq.com/wwopen/userQRCode?vcode=vcfc13b01dfs78e981c',
  mobile: '13800000000',
  email: 'zhangsan@gzdev.com',
  biz_mail: 'zhangsan@qyycs2.wecom.work',
  address: '广州市海珠区新港中路',
};
