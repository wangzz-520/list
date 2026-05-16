const categories = [
  { id: 'travel', name: '出行旅行', icon: '🧳', desc: '旅行、出差、露营、自驾' },
  { id: 'move', name: '搬家租房', icon: '🏠', desc: '搬家、租房、退租、新房' },
  { id: 'home', name: '装修家居', icon: '🛋️', desc: '装修、验收、家电、入住' },
  { id: 'daily', name: '日常生活', icon: '🧺', desc: '买菜、家庭采购、生活补货' },
  { id: 'family', name: '母婴家庭', icon: '👨‍👩‍👧', desc: '待产、宝宝、家庭应急' },
  { id: 'study', name: '学习考试', icon: '📚', desc: '开学、考试、面试、毕业' },
  { id: 'senior', name: '银发生活', icon: '👵', desc: '老人就医、防骗、手机设置' },
  { id: 'event', name: '活动筹备', icon: '🎉', desc: '聚会、婚礼、春节、年货' }
];

const templates = [
  {
    id: 'daily_grocery',
    title: '超市采购清单',
    category: 'daily',
    icon: '🛒',
    heat: 95,
    description: '下班买菜、周末采购、家庭补货都能用，按区域不漏买。',
    groups: [
      { id: 'fresh', name: '生鲜蔬果', items: ['绿叶菜', '根茎类蔬菜', '菌菇类', '当季水果', '鸡蛋', '豆制品', '肉类/禽类', '鱼虾水产', '葱姜蒜香菜'] },
      { id: 'staple', name: '主食干货', items: ['大米/杂粮', '面条/米粉', '馒头/面包', '速冻食品', '干香菇/木耳', '粉丝/腐竹', '燕麦/麦片', '方便食品'] },
      { id: 'seasoning', name: '调味补货', items: ['食用油', '盐', '酱油', '醋', '料酒', '蚝油', '白糖', '辣椒/花椒', '火锅底料/酱料'] },
      { id: 'daily', name: '顺手采购', items: ['牛奶/酸奶', '饮用水', '纸巾', '垃圾袋', '洗洁精', '保鲜袋/保鲜膜', '厨房湿巾', '零食水果'] }
    ]
  },
  {
    id: 'travel_basic',
    title: '旅行清单',
    category: 'travel',
    icon: '🧳',
    heat: 98,
    description: '适合短途、长途、亲子旅行，防止忘带证件和生活用品。',
    groups: [
      { id: 'docs', name: '证件资料', items: ['身份证', '驾驶证', '护照/通行证', '学生证/老年证', '车票/机票信息', '酒店预订截图', '保险/紧急联系人', '少量现金'] },
      { id: 'digital', name: '电子设备', items: ['手机', '充电器', '充电宝', '耳机', '相机/存储卡', '转换插头', '数据线', '自拍杆/支架'] },
      { id: 'daily', name: '生活用品', items: ['牙刷牙膏', '毛巾', '纸巾湿巾', '雨伞', '常用药品', '防晒用品', '洗发沐浴小样', '保温杯'] },
      { id: 'clothes', name: '衣物鞋帽', items: ['换洗衣物', '睡衣', '袜子', '外套', '舒适鞋', '内衣裤', '帽子', '泳衣/运动服'] }
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
      { id: 'work', name: '工作材料', items: ['电脑', '电脑充电器', '会议资料', '名片', '合同/报价单', '投影转接头', 'U 盘/移动硬盘', '笔记本和笔'] },
      { id: 'schedule', name: '行程确认', items: ['确认车票/机票', '确认酒店', '确认客户地址', '设置日程提醒', '同步同事行程', '保存发票抬头', '确认报销规则'] },
      { id: 'daily', name: '随身用品', items: ['身份证', '洗漱用品', '换洗衣物', '充电宝', '雨伞', '剃须/护肤用品', '常用药品', '备用口罩'] }
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
      { id: 'camp', name: '营地装备', items: ['帐篷', '地垫', '睡袋', '折叠桌椅', '营地灯', '天幕/地钉', '防潮垫', '收纳箱'] },
      { id: 'food', name: '餐饮用品', items: ['饮用水', '简餐食材', '餐具', '垃圾袋', '保温箱', '炉具/气罐', '调味料', '湿巾纸巾'] },
      { id: 'safety', name: '安全防护', items: ['驱蚊用品', '防晒用品', '急救包', '手电筒', '备用电池', '防风绳', '查看天气', '确认营地规则'] }
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
      { id: 'car', name: '车辆检查', items: ['检查油量/电量', '检查胎压', '检查雨刮', '检查灯光', '准备行车记录仪', '准备备用钥匙', '检查玻璃水', '检查备胎/补胎工具'] },
      { id: 'docs', name: '证件导航', items: ['身份证', '驾驶证', '行驶证', '导航路线', '停车位置记录', '高速通行方式', '目的地电话', '离线地图'] },
      { id: 'road', name: '路上用品', items: ['饮用水', '纸巾', '垃圾袋', '充电线', '应急药品', '零食', '颈枕/毛毯', '儿童安全座椅'] }
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
      { id: 'before7', name: '搬家前 7 天', items: ['确认搬家日期', '联系搬家公司', '处理不用的物品', '准备纸箱胶带', '给箱子贴标签', '修改收货地址', '预约宽带迁移', '通知物业/房东'] },
      { id: 'before1', name: '搬家前 1 天', items: ['贵重物品随身携带', '冰箱断电清理', '拍照留存房屋状态', '检查水电燃气', '整理钥匙门禁', '收好证件票据', '准备当天衣物', '给易碎品加固'] },
      { id: 'movingday', name: '搬家当天', items: ['清点箱子数量', '检查家具损坏', '确认费用', '交接钥匙', '检查旧房遗漏', '拍摄搬入状态', '确认大件摆放', '保留搬家单据'] }
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
      { id: 'water', name: '水电燃气', items: ['水龙头是否漏水', '下水是否通畅', '插座是否通电', '燃气是否正常', '电表水表拍照', '热水出水是否稳定', '马桶是否漏水', '开关是否松动'] },
      { id: 'device', name: '家具家电', items: ['空调能否制冷/制热', '冰箱是否正常', '洗衣机是否正常', '热水器是否正常', '门锁是否完好', '床垫是否干净', '柜门抽屉是否顺畅', '窗帘纱窗是否完好'] },
      { id: 'contract', name: '合同确认', items: ['租金押金金额', '付款周期', '维修责任', '退租规则', '违约条款', '能否养宠/转租', '物业水电收费方式', '家具清单拍照'] }
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
      { id: 'clean', name: '房屋整理', items: ['清理个人物品', '打扫厨房卫生', '打扫卫生间', '清空冰箱', '处理垃圾', '修补明显污渍', '拆除自购物品', '恢复家具原位'] },
      { id: 'settle', name: '费用结算', items: ['结清水费', '结清电费', '结清燃气费', '确认物业费', '押金退还方式', '核对租金尾款', '取消宽带/迁移', '保留缴费截图'] },
      { id: 'handover', name: '交接留痕', items: ['拍摄房屋视频', '归还钥匙门禁', '确认家具状态', '保存聊天记录', '签署退租确认', '确认押金到账时间', '删除门锁密码'] }
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
      { id: 'safety', name: '安全检查', items: ['换门锁/密码', '检查燃气报警器', '检查烟雾报警器', '检查窗户锁扣', '确认逃生通道', '检查配电箱标签', '测试门禁对讲', '准备灭火器'] },
      { id: 'daily', name: '生活准备', items: ['开通水电燃气', '设置网络宽带', '购买清洁用品', '准备垃圾袋', '准备常用工具', '购买拖鞋衣架', '准备基础药品', '安装窗帘/晾衣用品'] },
      { id: 'address', name: '地址更新', items: ['更新快递地址', '更新外卖地址', '通知亲友新地址', '保存物业电话', '保存楼栋门牌', '登记车辆/门禁', '绑定水电燃气户号'] }
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
      { id: 'water_electric', name: '水电验收', items: ['插座是否通电', '开关是否正常', '水龙头是否漏水', '下水是否顺畅', '强弱电箱标识', '漏保测试', '地漏排水测试', '冷热水方向确认'] },
      { id: 'wall', name: '墙地面', items: ['墙面是否开裂', '乳胶漆是否均匀', '瓷砖是否空鼓', '地板是否翘边', '踢脚线是否牢固', '美缝是否完整', '阴阳角是否平直', '墙面是否有污渍'] },
      { id: 'door_window', name: '门窗五金', items: ['门锁是否正常', '窗户是否漏风', '玻璃是否破损', '柜门是否平齐', '五金是否松动', '抽屉滑轨是否顺畅', '门吸是否牢固', '窗纱是否完整'] }
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
      { id: 'big', name: '大家电', items: ['冰箱', '洗衣机', '空调', '电视', '热水器', '油烟机', '燃气灶', '洗碗机'] },
      { id: 'small', name: '小家电', items: ['电饭煲', '烧水壶', '微波炉', '吸尘器', '吹风机', '空气炸锅', '电磁炉', '加湿器/除湿机'] },
      { id: 'check', name: '购买确认', items: ['确认尺寸', '确认安装条件', '确认保修政策', '确认送货时间', '保留发票凭证', '确认旧机回收', '确认安装辅材费用', '拍照留存型号'] }
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
      { id: 'mom', name: '妈妈用品', items: ['产褥垫', '一次性内裤', '哺乳内衣', '拖鞋', '洗漱用品', '吸管杯', '毛巾', '出院衣物'] },
      { id: 'baby', name: '宝宝用品', items: ['包被', '纸尿裤', '婴儿湿巾', '奶瓶', '宝宝衣物', '小帽子', '护臀用品', '棉柔巾'] },
      { id: 'docs', name: '证件资料', items: ['身份证', '医保卡', '产检资料', '银行卡/现金', '住院押金', '准生/生育资料', '检查报告', '紧急联系人'] }
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
      { id: 'care', name: '护理用品', items: ['纸尿裤', '湿巾', '纸巾', '隔尿垫', '备用衣物', '口水巾', '护臀用品', '免洗洗手液'] },
      { id: 'food', name: '喂养用品', items: ['奶瓶', '奶粉', '温水', '辅食', '围嘴', '勺子', '保温杯', '零食'] },
      { id: 'travel', name: '出行用品', items: ['婴儿车', '遮阳帽', '小毯子', '玩具', '垃圾袋', '背带/腰凳', '防晒驱蚊', '换尿布垫'] }
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
      { id: 'basic', name: '基础物资', items: ['饮用水', '压缩食品/方便食品', '手电筒', '充电宝', '备用电池', '收音机/备用手机', '保暖毯', '一次性餐具'] },
      { id: 'safety', name: '安全工具', items: ['急救包', '口罩', '消毒湿巾', '多功能工具', '应急联系卡', '哨子', '灭火器', '备用药品'] },
      { id: 'home', name: '家庭检查', items: ['确认燃气关闭', '确认门窗锁好', '保存重要证件照片', '准备少量现金', '备份家人电话', '确认集合地点', '照顾老人儿童用品'] }
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
      { id: 'study', name: '学习用品', items: ['书包', '文具', '笔记本', '教材资料', '文件袋', '便利贴', '计算器', '台灯'] },
      { id: 'daily', name: '生活用品', items: ['水杯', '纸巾', '雨伞', '换洗衣物', '洗漱用品', '拖鞋', '床品', '常用药品'] },
      { id: 'docs', name: '证件资料', items: ['身份证', '学生证', '录取/报到材料', '银行卡', '证件照', '户口本复印件', '缴费凭证', '校园卡资料'] }
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
      { id: 'before', name: '考前确认', items: ['确认考试时间', '确认考场地址', '打印准考证', '检查身份证', '设置闹钟', '规划交通路线', '准备住宿/午餐', '查看考场规则'] },
      { id: 'tools', name: '考试用品', items: ['黑色签字笔', '2B 铅笔', '橡皮', '尺子', '透明文件袋', '备用笔芯', '手表', '纸巾'] },
      { id: 'day', name: '考试当天', items: ['提前出门', '手机静音', '带水杯', '核对座位号', '检查答题卡', '确认姓名准考证号', '控制答题时间', '收好随身物品'] }
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
      { id: 'info', name: '信息确认', items: ['确认面试时间', '确认公司地址', '确认联系人', '了解岗位要求', '准备路线', '了解公司业务', '保存面试通知', '确认线上会议链接'] },
      { id: 'materials', name: '材料准备', items: ['简历', '作品集/项目说明', '身份证', '笔记本', '笔', '学历/证书材料', '过往项目资料', '纸质简历多份'] },
      { id: 'practice', name: '表达准备', items: ['自我介绍', '项目介绍', '离职原因', '期望薪资', '反问问题', '优势短板', '到岗时间', '通勤和工作时间问题'] }
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
      { id: 'docs', name: '证件资料', items: ['身份证', '医保卡', '就诊卡', '既往检查报告', '病历资料', '用药清单', '过敏记录', '检查预约单'] },
      { id: 'daily', name: '随身物品', items: ['水杯', '老花镜', '纸巾', '手机充电宝', '外套', '少量食物', '口罩', '便携坐垫'] },
      { id: 'contact', name: '联系信息', items: ['子女联系电话', '医院地址', '科室楼层', '预约时间截图', '返程方式', '停车位置', '陪诊人信息', '缴费方式'] }
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
      { id: 'phone', name: '电话短信', items: ['不透露验证码', '不点陌生链接', '不按陌生指示转账', '不下载不明 App', '遇事先问家人', '核实客服号码', '不共享屏幕', '不扫陌生二维码'] },
      { id: 'money', name: '资金安全', items: ['不相信高收益投资', '不向陌生账户汇款', '不把银行卡给别人', '不出租出售账号', '保存转账凭证', '关闭免密支付', '设置转账限额', '定期查看账单'] },
      { id: 'family', name: '家庭提醒', items: ['设置紧急联系人', '开启手机大字体', '收藏派出所电话', '定期沟通近况', '约定家庭暗号', '置顶子女聊天', '安装反诈提醒'] }
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
      { id: 'display', name: '显示设置', items: ['调大字体', '调高音量', '设置常用联系人', '整理桌面图标', '开启定位共享', '设置手电筒快捷入口', '开启来电闪光/震动'] },
      { id: 'safe', name: '安全设置', items: ['关闭陌生扣费服务', '设置锁屏密码', '开启应用权限提醒', '清理无用 App', '备份重要联系人', '关闭不必要通知', '检查支付安全'] },
      { id: 'wechat', name: '微信常用', items: ['置顶家人聊天', '收藏健康码入口', '设置视频通话提醒', '清理无关群聊', '教会发定位', '教会语音转文字', '设置紧急联系人'] }
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
      { id: 'trip', name: '返乡行程', items: ['身份证', '车票/机票', '充电器', '路上食物', '常用药品', '行李牌', '充电宝', '返程票提醒'] },
      { id: 'gift', name: '礼品红包', items: ['给父母的礼物', '给孩子的红包', '年货', '特产', '拜年名单', '礼品袋', '红包现金', '快递年货确认'] },
      { id: 'home', name: '离家检查', items: ['关闭燃气', '关闭门窗', '清理垃圾', '拔掉不用电器', '托管宠物/植物', '关闭水阀', '设置安防/摄像头', '告知邻居/物业'] }
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
      { id: 'plan', name: '活动安排', items: ['确定日期', '确定地点', '确认人数', '发送邀请', '准备预算', '确认过敏忌口', '安排交通停车', '准备备用方案'] },
      { id: 'goods', name: '物品准备', items: ['蛋糕', '蜡烛', '餐具', '饮料', '装饰用品', '纸巾湿巾', '垃圾袋', '蓝牙音箱'] },
      { id: 'day', name: '当天执行', items: ['提前布置', '确认外卖/餐食', '拍照留念', '清理现场', '收好礼物', '结算费用', '归还借用品'] }
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
      { id: 'early', name: '前期确认', items: ['确定预算', '确定日期', '确定酒店/场地', '确定婚纱摄影', '确定婚庆方案', '确认主持/化妆', '确认婚车', '确认婚礼流程'] },
      { id: 'guest', name: '宾客安排', items: ['整理宾客名单', '发送请柬', '安排座位', '确认伴郎伴娘', '准备红包', '统计住宿需求', '安排接送', '确认长辈名单'] },
      { id: 'day', name: '婚礼当天', items: ['确认化妆时间', '确认车队', '确认戒指', '确认摄影摄像', '准备应急包', '准备誓词/发言稿', '保管礼金', '确认敬酒用品'] }
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
