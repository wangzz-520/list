const categories = [
  { id: 'travel', name: '出行旅行', icon: '🧳', desc: '旅行、出差、露营、自驾' },
  { id: 'move', name: '搬家租房', icon: '🏠', desc: '搬家、租房、退租、新房' },
  { id: 'home', name: '装修家居', icon: '🛋️', desc: '装修、验收、家电、入住' },
  { id: 'family', name: '母婴家庭', icon: '👨‍👩‍👧', desc: '待产、宝宝、家庭应急' },
  { id: 'study', name: '学习考试', icon: '📚', desc: '开学、考试、面试、毕业' },
  { id: 'senior', name: '银发生活', icon: '👵', desc: '老人就医、防骗、手机设置' },
  { id: 'event', name: '活动筹备', icon: '🎉', desc: '聚会、婚礼、春节、年货' }
];

const templates = [
  {
    id: 'travel_basic',
    title: '旅行清单',
    category: 'travel',
    icon: '🧳',
    heat: 98,
    description: '适合短途、长途、亲子旅行，防止忘带证件和生活用品。',
    groups: [
      { id: 'docs', name: '证件资料', items: ['身份证', '驾驶证', '护照/通行证', '学生证/老年证', '车票/机票信息'] },
      { id: 'digital', name: '电子设备', items: ['手机', '充电器', '充电宝', '耳机', '相机/存储卡'] },
      { id: 'daily', name: '生活用品', items: ['牙刷牙膏', '毛巾', '纸巾湿巾', '雨伞', '常用药品'] },
      { id: 'clothes', name: '衣物鞋帽', items: ['换洗衣物', '睡衣', '袜子', '外套', '舒适鞋'] }
    ]
  },
  {
    id: 'business_trip',
    title: '出差清单',
    category: 'travel',
    icon: '💼',
    heat: 86,
    description: '适合临时出差、会议、客户拜访。',
    groups: [
      { id: 'work', name: '工作材料', items: ['电脑', '电脑充电器', '会议资料', '名片', '合同/报价单'] },
      { id: 'schedule', name: '行程确认', items: ['确认车票/机票', '确认酒店', '确认客户地址', '设置日程提醒'] },
      { id: 'daily', name: '随身用品', items: ['身份证', '洗漱用品', '换洗衣物', '充电宝', '雨伞'] }
    ]
  },
  {
    id: 'camping',
    title: '露营清单',
    category: 'travel',
    icon: '⛺',
    heat: 75,
    description: '适合周末露营、亲子户外、自驾营地。',
    groups: [
      { id: 'camp', name: '营地装备', items: ['帐篷', '地垫', '睡袋', '折叠桌椅', '营地灯'] },
      { id: 'food', name: '餐饮用品', items: ['饮用水', '简餐食材', '餐具', '垃圾袋', '保温箱'] },
      { id: 'safety', name: '安全防护', items: ['驱蚊用品', '防晒用品', '急救包', '手电筒', '备用电池'] }
    ]
  },
  {
    id: 'self_drive',
    title: '自驾游清单',
    category: 'travel',
    icon: '🚗',
    heat: 72,
    description: '适合自驾出行、长途开车、家庭出游。',
    groups: [
      { id: 'car', name: '车辆检查', items: ['检查油量/电量', '检查胎压', '检查雨刮', '准备行车记录仪', '准备备用钥匙'] },
      { id: 'docs', name: '证件导航', items: ['身份证', '驾驶证', '行驶证', '导航路线', '停车位置记录'] },
      { id: 'road', name: '路上用品', items: ['饮用水', '纸巾', '垃圾袋', '充电线', '应急药品'] }
    ]
  },
  {
    id: 'moving_home',
    title: '搬家清单',
    category: 'move',
    icon: '📦',
    heat: 96,
    description: '按时间阶段整理搬家事项，避免遗漏交接和贵重物品。',
    groups: [
      { id: 'before7', name: '搬家前 7 天', items: ['确认搬家日期', '联系搬家公司', '处理不用的物品', '准备纸箱胶带', '修改收货地址'] },
      { id: 'before1', name: '搬家前 1 天', items: ['贵重物品随身携带', '冰箱断电清理', '拍照留存房屋状态', '检查水电燃气', '整理钥匙门禁'] },
      { id: 'movingday', name: '搬家当天', items: ['清点箱子数量', '检查家具损坏', '确认费用', '交接钥匙', '检查旧房遗漏'] }
    ]
  },
  {
    id: 'rent_inspection',
    title: '租房验房清单',
    category: 'move',
    icon: '🔍',
    heat: 88,
    description: '看房、签约前检查房屋设施，降低入住后的沟通成本。',
    groups: [
      { id: 'water', name: '水电燃气', items: ['水龙头是否漏水', '下水是否通畅', '插座是否通电', '燃气是否正常', '电表水表拍照'] },
      { id: 'device', name: '家具家电', items: ['空调能否制冷/制热', '冰箱是否正常', '洗衣机是否正常', '热水器是否正常', '门锁是否完好'] },
      { id: 'contract', name: '合同确认', items: ['租金押金金额', '付款周期', '维修责任', '退租规则', '违约条款'] }
    ]
  },
  {
    id: 'checkout_rent',
    title: '退租清单',
    category: 'move',
    icon: '🧾',
    heat: 70,
    description: '退租前检查清洁、押金、水电和钥匙交接。',
    groups: [
      { id: 'clean', name: '房屋整理', items: ['清理个人物品', '打扫厨房卫生', '打扫卫生间', '清空冰箱', '处理垃圾'] },
      { id: 'settle', name: '费用结算', items: ['结清水费', '结清电费', '结清燃气费', '确认物业费', '押金退还方式'] },
      { id: 'handover', name: '交接留痕', items: ['拍摄房屋视频', '归还钥匙门禁', '确认家具状态', '保存聊天记录'] }
    ]
  },
  {
    id: 'new_home',
    title: '新房入住清单',
    category: 'home',
    icon: '🏡',
    heat: 84,
    description: '搬进新家前后的必备检查和生活准备。',
    groups: [
      { id: 'safety', name: '安全检查', items: ['换门锁/密码', '检查燃气报警器', '检查烟雾报警器', '检查窗户锁扣', '确认逃生通道'] },
      { id: 'daily', name: '生活准备', items: ['开通水电燃气', '设置网络宽带', '购买清洁用品', '准备垃圾袋', '准备常用工具'] },
      { id: 'address', name: '地址更新', items: ['更新快递地址', '更新外卖地址', '通知亲友新地址', '保存物业电话'] }
    ]
  },
  {
    id: 'renovation_acceptance',
    title: '装修验收清单',
    category: 'home',
    icon: '🧰',
    heat: 92,
    description: '普通用户可用的基础验收清单，仅做生活检查提醒。',
    groups: [
      { id: 'water_electric', name: '水电验收', items: ['插座是否通电', '开关是否正常', '水龙头是否漏水', '下水是否顺畅', '强弱电箱标识'] },
      { id: 'wall', name: '墙地面', items: ['墙面是否开裂', '乳胶漆是否均匀', '瓷砖是否空鼓', '地板是否翘边', '踢脚线是否牢固'] },
      { id: 'door_window', name: '门窗五金', items: ['门锁是否正常', '窗户是否漏风', '玻璃是否破损', '柜门是否平齐', '五金是否松动'] }
    ]
  },
  {
    id: 'appliance_buy',
    title: '家电购买清单',
    category: 'home',
    icon: '🔌',
    heat: 67,
    description: '新房、租房、宿舍采购家电时使用。',
    groups: [
      { id: 'big', name: '大家电', items: ['冰箱', '洗衣机', '空调', '电视', '热水器'] },
      { id: 'small', name: '小家电', items: ['电饭煲', '烧水壶', '微波炉', '吸尘器', '吹风机'] },
      { id: 'check', name: '购买确认', items: ['确认尺寸', '确认安装条件', '确认保修政策', '确认送货时间', '保留发票凭证'] }
    ]
  },
  {
    id: 'hospital_bag',
    title: '待产包清单',
    category: 'family',
    icon: '🍼',
    heat: 89,
    description: '住院生产前的物品准备提醒，不包含医疗建议。',
    groups: [
      { id: 'mom', name: '妈妈用品', items: ['产褥垫', '一次性内裤', '哺乳内衣', '拖鞋', '洗漱用品'] },
      { id: 'baby', name: '宝宝用品', items: ['包被', '纸尿裤', '婴儿湿巾', '奶瓶', '宝宝衣物'] },
      { id: 'docs', name: '证件资料', items: ['身份证', '医保卡', '产检资料', '银行卡/现金', '住院押金'] }
    ]
  },
  {
    id: 'baby_outdoor',
    title: '宝宝出门清单',
    category: 'family',
    icon: '👶',
    heat: 73,
    description: '带宝宝出门、看医生、短途游玩可用。',
    groups: [
      { id: 'care', name: '护理用品', items: ['纸尿裤', '湿巾', '纸巾', '隔尿垫', '备用衣物'] },
      { id: 'food', name: '喂养用品', items: ['奶瓶', '奶粉', '温水', '辅食', '围嘴'] },
      { id: 'travel', name: '出行用品', items: ['婴儿车', '遮阳帽', '小毯子', '玩具', '垃圾袋'] }
    ]
  },
  {
    id: 'family_emergency',
    title: '家庭应急物资清单',
    category: 'family',
    icon: '🧯',
    heat: 81,
    description: '家庭停电、极端天气、短期应急准备。',
    groups: [
      { id: 'basic', name: '基础物资', items: ['饮用水', '压缩食品/方便食品', '手电筒', '充电宝', '备用电池'] },
      { id: 'safety', name: '安全工具', items: ['急救包', '口罩', '消毒湿巾', '多功能工具', '应急联系卡'] },
      { id: 'home', name: '家庭检查', items: ['确认燃气关闭', '确认门窗锁好', '保存重要证件照片', '准备少量现金'] }
    ]
  },
  {
    id: 'school_start',
    title: '开学清单',
    category: 'study',
    icon: '🎒',
    heat: 85,
    description: '学生开学、返校、宿舍入住准备。',
    groups: [
      { id: 'study', name: '学习用品', items: ['书包', '文具', '笔记本', '教材资料', '文件袋'] },
      { id: 'daily', name: '生活用品', items: ['水杯', '纸巾', '雨伞', '换洗衣物', '洗漱用品'] },
      { id: 'docs', name: '证件资料', items: ['身份证', '学生证', '录取/报到材料', '银行卡', '证件照'] }
    ]
  },
  {
    id: 'exam_prepare',
    title: '考试准备清单',
    category: 'study',
    icon: '📝',
    heat: 78,
    description: '适合校内考试、等级考试、资格考试。',
    groups: [
      { id: 'before', name: '考前确认', items: ['确认考试时间', '确认考场地址', '打印准考证', '检查身份证', '设置闹钟'] },
      { id: 'tools', name: '考试用品', items: ['黑色签字笔', '2B 铅笔', '橡皮', '尺子', '透明文件袋'] },
      { id: 'day', name: '考试当天', items: ['提前出门', '手机静音', '带水杯', '核对座位号', '检查答题卡'] }
    ]
  },
  {
    id: 'interview_prepare',
    title: '面试准备清单',
    category: 'study',
    icon: '🤝',
    heat: 82,
    description: '适合求职面试、实习面试、项目面谈。',
    groups: [
      { id: 'info', name: '信息确认', items: ['确认面试时间', '确认公司地址', '确认联系人', '了解岗位要求', '准备路线'] },
      { id: 'materials', name: '材料准备', items: ['简历', '作品集/项目说明', '身份证', '笔记本', '笔'] },
      { id: 'practice', name: '表达准备', items: ['自我介绍', '项目介绍', '离职原因', '期望薪资', '反问问题'] }
    ]
  },
  {
    id: 'senior_hospital',
    title: '老人就医准备清单',
    category: 'senior',
    icon: '🏥',
    heat: 87,
    description: '子女帮父母看病前整理材料和随身物品，不提供诊疗建议。',
    groups: [
      { id: 'docs', name: '证件资料', items: ['身份证', '医保卡', '就诊卡', '既往检查报告', '病历资料'] },
      { id: 'daily', name: '随身物品', items: ['水杯', '老花镜', '纸巾', '手机充电宝', '外套'] },
      { id: 'contact', name: '联系信息', items: ['子女联系电话', '医院地址', '科室楼层', '预约时间截图', '返程方式'] }
    ]
  },
  {
    id: 'anti_fraud',
    title: '防诈骗检查清单',
    category: 'senior',
    icon: '🛡️',
    heat: 83,
    description: '适合转发给父母和家人，做常见风险自查。',
    groups: [
      { id: 'phone', name: '电话短信', items: ['不透露验证码', '不点陌生链接', '不按陌生指示转账', '不下载不明 App', '遇事先问家人'] },
      { id: 'money', name: '资金安全', items: ['不相信高收益投资', '不向陌生账户汇款', '不把银行卡给别人', '不出租出售账号', '保存转账凭证'] },
      { id: 'family', name: '家庭提醒', items: ['设置紧急联系人', '开启手机大字体', '收藏派出所电话', '定期沟通近况'] }
    ]
  },
  {
    id: 'senior_phone',
    title: '老人手机设置清单',
    category: 'senior',
    icon: '📱',
    heat: 76,
    description: '帮父母把手机调成更容易使用的状态。',
    groups: [
      { id: 'display', name: '显示设置', items: ['调大字体', '调高音量', '设置常用联系人', '整理桌面图标', '开启定位共享'] },
      { id: 'safe', name: '安全设置', items: ['关闭陌生扣费服务', '设置锁屏密码', '开启应用权限提醒', '清理无用 App', '备份重要联系人'] },
      { id: 'wechat', name: '微信常用', items: ['置顶家人聊天', '收藏健康码入口', '设置视频通话提醒', '清理无关群聊'] }
    ]
  },
  {
    id: 'spring_home',
    title: '春节回家清单',
    category: 'event',
    icon: '🧧',
    heat: 91,
    description: '春节返乡、走亲访友、家中检查。',
    groups: [
      { id: 'trip', name: '返乡行程', items: ['身份证', '车票/机票', '充电器', '路上食物', '常用药品'] },
      { id: 'gift', name: '礼品红包', items: ['给父母的礼物', '给孩子的红包', '年货', '特产', '拜年名单'] },
      { id: 'home', name: '离家检查', items: ['关闭燃气', '关闭门窗', '清理垃圾', '拔掉不用电器', '托管宠物/植物'] }
    ]
  },
  {
    id: 'party_prepare',
    title: '生日聚会清单',
    category: 'event',
    icon: '🎂',
    heat: 66,
    description: '家庭生日、朋友聚会、小型活动筹备。',
    groups: [
      { id: 'plan', name: '活动安排', items: ['确定日期', '确定地点', '确认人数', '发送邀请', '准备预算'] },
      { id: 'goods', name: '物品准备', items: ['蛋糕', '蜡烛', '餐具', '饮料', '装饰用品'] },
      { id: 'day', name: '当天执行', items: ['提前布置', '确认外卖/餐食', '拍照留念', '清理现场'] }
    ]
  },
  {
    id: 'wedding_prepare',
    title: '婚礼筹备清单',
    category: 'event',
    icon: '💍',
    heat: 80,
    description: '婚礼前基础筹备事项，适合普通用户做进度管理。',
    groups: [
      { id: 'early', name: '前期确认', items: ['确定预算', '确定日期', '确定酒店/场地', '确定婚纱摄影', '确定婚庆方案'] },
      { id: 'guest', name: '宾客安排', items: ['整理宾客名单', '发送请柬', '安排座位', '确认伴郎伴娘', '准备红包'] },
      { id: 'day', name: '婚礼当天', items: ['确认化妆时间', '确认车队', '确认戒指', '确认摄影摄像', '准备应急包'] }
    ]
  }
];

function getCategoryById(id) {
  return categories.find(item => item.id === id);
}

function getAllTemplates() {
  return templates.map(item => ({ ...item }));
}

function findTemplateById(id) {
  const found = templates.find(item => item.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

function getTemplatesByCategory(category) {
  return templates.filter(item => item.category === category).map(item => ({ ...item }));
}

function searchTemplates(keyword) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return getAllTemplates();
  return templates.filter(item => {
    const category = getCategoryById(item.category);
    const groupTexts = (item.groups || []).reduce((rows, group) => {
      rows.push(group.name);
      (group.items || []).forEach(text => rows.push(text));
      return rows;
    }, []);
    const haystack = [
      item.title,
      item.description,
      item.category,
      category ? category.name : '',
      ...groupTexts
    ].join(' ').toLowerCase();
    return haystack.includes(kw);
  }).map(item => ({ ...item }));
}

module.exports = {
  categories,
  templates,
  getCategoryById,
  getAllTemplates,
  findTemplateById,
  getTemplatesByCategory,
  searchTemplates
};
