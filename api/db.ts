import initSqlJs from 'sql.js'

type SqlJsDatabase = ReturnType<Awaited<ReturnType<typeof initSqlJs>>['Database']>
let db: SqlJsDatabase

export async function initDb() {
  if (db) return db
  const SQL = await initSqlJs()
  db = new SQL.Database()

  db.run(`
    CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, avatar TEXT, role TEXT DEFAULT 'user', created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE babies (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, gender TEXT NOT NULL, birth_date TEXT NOT NULL, avatar TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE growth_records (id INTEGER PRIMARY KEY AUTOINCREMENT, baby_id INTEGER NOT NULL, height REAL NOT NULL, weight REAL NOT NULL, record_date TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE vaccine_records (id INTEGER PRIMARY KEY AUTOINCREMENT, baby_id INTEGER NOT NULL, vaccine_name TEXT NOT NULL, vaccinated_date TEXT, hospital TEXT, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, original_price REAL, image TEXT, description TEXT, age_min INTEGER, age_max INTEGER, stock INTEGER DEFAULT 0, sales INTEGER DEFAULT 0, warehouse_city TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE cart_items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1, spec TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, total_amount REAL NOT NULL, status TEXT DEFAULT 'pending', address TEXT NOT NULL, city TEXT, warehouse TEXT, payment_method TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, price REAL NOT NULL, spec TEXT);
    CREATE TABLE logistics_records (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, status TEXT NOT NULL, description TEXT, location TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, avatar TEXT, rating REAL DEFAULT 0, specialty TEXT, bio TEXT);
    CREATE TABLE courses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, teacher_id INTEGER, cover_image TEXT, description TEXT, price REAL NOT NULL, duration INTEGER, age_min INTEGER, age_max INTEGER, rating REAL DEFAULT 0);
    CREATE TABLE schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, teacher_id INTEGER NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, capacity INTEGER DEFAULT 10, booked INTEGER DEFAULT 0);
    CREATE TABLE course_tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, schedule_id INTEGER NOT NULL, course_id INTEGER NOT NULL, status TEXT DEFAULT 'active', qr_code TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE growth_track_items (id INTEGER PRIMARY KEY AUTOINCREMENT, ticket_id INTEGER NOT NULL, baby_id INTEGER NOT NULL, teacher_comment TEXT, checkin_time TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT NOT NULL, images TEXT, tags TEXT, like_count INTEGER DEFAULT 0, comment_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE post_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, UNIQUE(post_id, user_id));
    CREATE TABLE insurance_products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL, coverage_amount REAL NOT NULL, premium REAL NOT NULL, age_min INTEGER, age_max INTEGER, description TEXT, features TEXT);
    CREATE TABLE insurance_policies (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, insured_name TEXT NOT NULL, insured_id TEXT NOT NULL, premium REAL NOT NULL, status TEXT DEFAULT 'active', start_date TEXT, end_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE claims (id INTEGER PRIMARY KEY AUTOINCREMENT, policy_id INTEGER NOT NULL, user_id INTEGER NOT NULL, amount REAL NOT NULL, documents TEXT, description TEXT, status TEXT DEFAULT 'initial_review', review_note TEXT, created_at TEXT DEFAULT (datetime('now')), reviewed_at TEXT);
    CREATE TABLE member_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, level TEXT DEFAULT 'normal', annual_spending REAL DEFAULT 0, activity_score INTEGER DEFAULT 0, points INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, value REAL NOT NULL, min_spend REAL DEFAULT 0, status TEXT DEFAULT 'available', expires_at TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE warehouses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL);
    CREATE TABLE warehouse_inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, warehouse_id INTEGER NOT NULL, product_id INTEGER NOT NULL, stock INTEGER DEFAULT 0, UNIQUE(warehouse_id, product_id));
    CREATE TABLE stockout_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, warehouse_id INTEGER NOT NULL, product_id INTEGER NOT NULL, requested INTEGER NOT NULL, available INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  `)

  const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
  const imgSize = '&image_size=square_hd'

  db.run(`INSERT INTO users (phone, password, name, avatar, role) VALUES ('13800000001', '123456', '管理员', '${imgBase}admin%20avatar${imgSize}', 'admin')`)
  db.run(`INSERT INTO users (phone, password, name, avatar, role) VALUES ('13800000002', '123456', '张妈妈', '${imgBase}young%20chinese%20mother%20avatar${imgSize}', 'user')`)
  db.run(`INSERT INTO users (phone, password, name, avatar, role) VALUES ('13800000003', '123456', '李爸爸', '${imgBase}young%20chinese%20father%20avatar${imgSize}', 'user')`)

  db.run(`INSERT INTO babies (user_id, name, gender, birth_date, avatar) VALUES (2, '小萌', '女', '2024-03-15', '${imgBase}cute%20baby%20girl${imgSize}')`)
  db.run(`INSERT INTO babies (user_id, name, gender, birth_date, avatar) VALUES (2, '小帅', '男', '2025-01-20', '${imgBase}cute%20baby%20boy${imgSize}')`)
  db.run(`INSERT INTO babies (user_id, name, gender, birth_date, avatar) VALUES (3, '小宝', '男', '2024-08-10', '${imgBase}cute%20baby%20boy%20smiling${imgSize}')`)
  db.run(`INSERT INTO babies (user_id, name, gender, birth_date, avatar) VALUES (3, '小美', '女', '2025-05-01', '${imgBase}cute%20newborn%20baby%20girl${imgSize}')`)

  db.run(`INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (1, 65.5, 7.2, '2024-09-15')`)
  db.run(`INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (1, 70.3, 8.5, '2024-12-15')`)
  db.run(`INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (1, 75.0, 9.8, '2025-03-15')`)
  db.run(`INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (3, 62.0, 6.8, '2025-02-10')`)
  db.run(`INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (3, 68.5, 8.0, '2025-05-10')`)

  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (1, '乙肝疫苗(第1剂)', '2024-03-16', '市妇幼保健院', 'done')`)
  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (1, '卡介苗', '2024-03-16', '市妇幼保健院', 'done')`)
  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (1, '脊灰疫苗(第1剂)', '2024-04-15', '市妇幼保健院', 'done')`)
  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, status) VALUES (1, '麻疹疫苗', 'pending')`)
  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (3, '乙肝疫苗(第1剂)', '2024-08-11', '区人民医院', 'done')`)
  db.run(`INSERT INTO vaccine_records (baby_id, vaccine_name, status) VALUES (3, '百白破疫苗', 'pending')`)

  const products = [
    ["贝贝金装婴儿配方奶粉1段", "奶粉", 268, 328, `${imgBase}baby%20formula%20milk%20powder%20tin%20stage1${imgSize}`, "0-6个月婴儿专用配方奶粉，富含DHA+ARA，接近母乳配方", 0, 6, 200, 1580, "上海"],
    ["贝贝金装婴儿配方奶粉2段", "奶粉", 248, 298, `${imgBase}baby%20formula%20milk%20powder%20tin%20stage2${imgSize}`, "6-12个月较大婴儿配方奶粉，添加益生元组合", 6, 12, 180, 1320, "上海"],
    ["贝贝金装幼儿配方奶粉3段", "奶粉", 228, 268, `${imgBase}toddler%20formula%20milk%20powder%20tin%20stage3${imgSize}`, "12-36个月幼儿配方奶粉，助力宝宝成长发育", 12, 36, 160, 980, "上海"],
    ["贝贝有机奶粉1段", "奶粉", 358, 428, `${imgBase}organic%20baby%20formula%20milk%20powder${imgSize}`, "有机认证配方奶粉，纯净天然，0添加", 0, 6, 80, 560, "杭州"],
    ["贝贝羊奶粉2段", "奶粉", 328, 388, `${imgBase}goat%20milk%20baby%20formula%20powder${imgSize}`, "山羊奶配方，分子小易吸收，适合牛奶蛋白过敏宝宝", 6, 12, 60, 420, "杭州"],
    ["贝贝特殊配方奶粉", "奶粉", 398, 458, `${imgBase}special%20baby%20formula%20milk%20powder${imgSize}`, "特殊医学用途配方奶粉，深度水解蛋白", 0, 12, 30, 210, "广州"],
    ["贝贝超薄透气纸尿裤NB号", "尿布", 89, 119, `${imgBase}baby%20diapers%20newborn%20pack${imgSize}`, "新生儿专用，0-5kg，超薄透气0.1cm", 0, 1, 500, 3200, "苏州"],
    ["贝贝超薄透气纸尿裤S号", "尿布", 99, 129, `${imgBase}baby%20diapers%20small%20pack${imgSize}`, "小号纸尿裤，5-8kg，12小时干爽", 1, 3, 450, 2800, "苏州"],
    ["贝贝超薄透气纸尿裤M号", "尿布", 109, 139, `${imgBase}baby%20diapers%20medium%20pack${imgSize}`, "中号纸尿裤，6-11kg，弹性腰围", 3, 8, 400, 2500, "苏州"],
    ["贝贝超薄透气纸尿裤L号", "尿布", 119, 149, `${imgBase}baby%20diapers%20large%20pack${imgSize}`, "大号纸尿裤，9-14kg，防漏立体护围", 8, 15, 350, 2100, "苏州"],
    ["贝贝益智积木套装", "玩具", 158, 198, `${imgBase}baby%20educational%20building%20blocks%20toy${imgSize}`, "大颗粒积木80块，防吞咽设计，锻炼手眼协调", 12, 36, 150, 890, "深圳"],
    ["贝贝音乐手机玩具", "玩具", 68, 98, `${imgBase}baby%20music%20phone%20toy${imgSize}`, "模拟手机造型，中英文双语，多种音效互动", 0, 24, 200, 1560, "深圳"],
    ["贝贝早教认知卡片", "玩具", 48, 68, `${imgBase}baby%20educational%20flash%20cards${imgSize}`, "108张双面认知卡，涵盖动物水果交通工具", 0, 36, 300, 2100, "深圳"],
    ["贝贝软胶摇铃套装", "玩具", 78, 108, `${imgBase}baby%20soft%20rattle%20toy%20set${imgSize}`, "食品级硅胶材质，4件套，可高温消毒", 0, 12, 250, 1800, "深圳"],
    ["贝贝有机米粉", "辅食", 58, 78, `${imgBase}baby%20organic%20rice%20cereal${imgSize}`, "有机大米原料，强化铁锌钙，细腻易冲泡", 4, 12, 200, 1200, "武汉"],
    ["贝贝果泥混合装", "辅食", 38, 52, `${imgBase}baby%20fruit%20puree%20pouch${imgSize}`, "6种水果混合，无添加糖，便携吸嘴装", 6, 24, 300, 1800, "武汉"],
    ["贝贝营养面条", "辅食", 28, 38, `${imgBase}baby%20nutritious%20noodles${imgSize}`, "蔬菜汁和面，细软易煮，多种口味可选", 8, 36, 250, 1400, "武汉"],
    ["贝贝婴儿润肤乳", "洗护", 68, 88, `${imgBase}baby%20moisturizing%20lotion${imgSize}`, "温和无刺激，24小时持久保湿，弱酸性配方", 0, 72, 180, 1100, "广州"],
    ["贝贝婴儿洗发沐浴露", "洗护", 58, 78, `${imgBase}baby%20shampoo%20body%20wash${imgSize}`, "二合一配方，无泪配方，天然植物精华", 0, 72, 200, 1300, "广州"],
    ["贝贝婴儿防晒霜", "洗护", 88, 118, `${imgBase}baby%20sunscreen%20lotion${imgSize}`, "物理防晒SPF30，温和不刺激，6个月以上使用", 6, 72, 120, 680, "广州"],
    ["贝贝纯棉连体衣", "服饰", 79, 129, `${imgBase}baby%20cotton%20romper%20bodysuit${imgSize}`, "100%精梳棉，开档设计易换尿布，A类标准", 0, 12, 200, 1500, "杭州"],
    ["贝贝冬季保暖套装", "服饰", 158, 228, `${imgBase}baby%20winter%20warm%20clothing%20set${imgSize}`, "夹棉外套+裤子，柔软亲肤，加厚保暖", 6, 36, 100, 680, "杭州"],
  ]
  for (const p of products) {
    db.run(`INSERT INTO products (name, category, price, original_price, image, description, age_min, age_max, stock, sales, warehouse_city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, p as any)
  }

  db.run(`INSERT INTO teachers (name, avatar, rating, specialty, bio) VALUES ('王老师', '${imgBase}female%20teacher%20portrait${imgSize}', 4.9, '感统训练', '高级感统训练师，10年从业经验，擅长0-3岁婴幼儿感统评估与训练')`)
  db.run(`INSERT INTO teachers (name, avatar, rating, specialty, bio) VALUES ('李老师', '${imgBase}music%20teacher%20portrait${imgSize}', 4.8, '音乐启蒙', '音乐学院毕业，奥尔夫音乐认证教师，专注幼儿音乐启蒙6年')`)
  db.run(`INSERT INTO teachers (name, avatar, rating, specialty, bio) VALUES ('赵老师', '${imgBase}art%20teacher%20portrait${imgSize}', 4.7, '美术创意', '美术教育硕士，儿童创意美术专家，出版多部幼儿美术教材')`)
  db.run(`INSERT INTO teachers (name, avatar, rating, specialty, bio) VALUES ('陈老师', '${imgBase}sports%20coach%20portrait${imgSize}', 4.9, '运动发展', '体育教育专业，儿童体能训练师认证，擅长亲子运动指导')`)

  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('感统启蒙课', '感统训练', 1, '${imgBase}baby%20sensory%20integration%20training%20class${imgSize}', '通过专业感统器材，刺激宝宝触觉、前庭觉和本体觉发展', 199, 45, 6, 24, 4.9)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('感统进阶课', '感统训练', 1, '${imgBase}baby%20advanced%20sensory%20class${imgSize}', '针对感统失调风险的宝宝，系统化训练方案', 259, 60, 18, 48, 4.8)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('音乐律动课', '音乐启蒙', 2, '${imgBase}baby%20music%20rhythm%20class${imgSize}', '奥尔夫音乐教学法，培养节奏感和音乐表现力', 169, 40, 6, 36, 4.8)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('音乐欣赏课', '音乐启蒙', 2, '${imgBase}baby%20music%20appreciation%20class${imgSize}', '世界名曲赏析，培养音乐审美和专注力', 149, 40, 12, 48, 4.7)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('创意绘画课', '美术创意', 3, '${imgBase}baby%20creative%20painting%20class${imgSize}', '自由涂鸦+引导创作，激发想象力与色彩感知', 189, 50, 18, 48, 4.7)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('手工制作课', '美术创意', 3, '${imgBase}baby%20handcraft%20art%20class${imgSize}', '黏土、剪纸、拼贴等多元手工，锻炼精细动作', 179, 50, 24, 72, 4.6)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('体能训练课', '运动发展', 4, '${imgBase}baby%20physical%20fitness%20training${imgSize}', '科学体能训练方案，增强体质促进生长发育', 199, 45, 12, 48, 4.9)`)
  db.run(`INSERT INTO courses (name, category, teacher_id, cover_image, description, price, duration, age_min, age_max, rating) VALUES ('亲子运动课', '运动发展', 4, '${imgBase}parent%20child%20sports%20class${imgSize}', '亲子互动运动，增进亲子关系的同时锻炼身体', 219, 50, 6, 36, 4.9)`)

  const scheduleData = [
    [1, 1, '2026-06-10', '09:00', '09:45', 8, 3],
    [1, 1, '2026-06-12', '10:00', '10:45', 8, 5],
    [2, 1, '2026-06-11', '14:00', '15:00', 6, 2],
    [2, 1, '2026-06-13', '14:00', '15:00', 6, 4],
    [3, 2, '2026-06-10', '10:00', '10:40', 10, 6],
    [3, 2, '2026-06-12', '15:00', '15:40', 10, 3],
    [4, 2, '2026-06-11', '09:00', '09:40', 10, 4],
    [4, 2, '2026-06-13', '16:00', '16:40', 10, 2],
    [5, 3, '2026-06-10', '14:00', '14:50', 8, 5],
    [5, 3, '2026-06-12', '09:00', '09:50', 8, 3],
    [6, 3, '2026-06-11', '10:00', '10:50', 8, 2],
    [6, 3, '2026-06-13', '10:00', '10:50', 8, 4],
    [7, 4, '2026-06-10', '16:00', '16:45', 10, 7],
    [7, 4, '2026-06-12', '11:00', '11:45', 10, 5],
    [8, 4, '2026-06-11', '09:00', '09:50', 12, 8],
    [8, 4, '2026-06-13', '09:00', '09:50', 12, 6],
  ]
  for (const s of scheduleData) {
    db.run(`INSERT INTO schedules (course_id, teacher_id, date, start_time, end_time, capacity, booked) VALUES (?, ?, ?, ?, ?, ?, ?)`, s as any)
  }

  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华东仓', '上海', 31.23, 121.47)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华南仓', '广州', 23.13, 113.26)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华中仓', '武汉', 30.59, 114.31)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华东2仓', '杭州', 30.27, 120.15)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华南2仓', '深圳', 22.54, 114.06)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华东3仓', '苏州', 31.30, 120.62)`)
  db.run(`INSERT INTO warehouses (name, city, lat, lng) VALUES ('华北仓', '北京', 39.90, 116.40)`)

  const warehouseInventory: [number, number, number][] = [
    [1, 1, 60], [1, 2, 50], [1, 3, 40], [1, 7, 100], [1, 8, 90], [1, 9, 80], [1, 10, 70],
    [1, 15, 50], [1, 16, 70], [1, 17, 60],
    [2, 6, 15], [2, 18, 50], [2, 19, 60], [2, 20, 35],
    [2, 1, 40], [2, 7, 80], [2, 15, 50],
    [3, 15, 60], [3, 16, 90], [3, 17, 70],
    [3, 1, 30], [3, 2, 40], [3, 7, 60],
    [4, 4, 30], [4, 5, 20], [4, 21, 60], [4, 22, 30],
    [4, 1, 20], [4, 15, 30],
    [5, 11, 50], [5, 12, 70], [5, 13, 100], [5, 14, 80],
    [5, 1, 20], [5, 7, 50],
    [6, 7, 120], [6, 8, 110], [6, 9, 100], [6, 10, 90],
    [6, 1, 30], [6, 15, 40],
    [7, 1, 50], [7, 2, 40], [7, 7, 80], [7, 15, 60],
    [7, 8, 60], [7, 9, 50], [7, 10, 40],
  ]
  for (const [wid, pid, stock] of warehouseInventory) {
    db.run(`INSERT INTO warehouse_inventory (warehouse_id, product_id, stock) VALUES (?, ?, ?)`, [wid, pid, stock])
  }

  db.run(`INSERT INTO cart_items (user_id, product_id, quantity, spec) VALUES (2, 1, 2, '1段')`)
  db.run(`INSERT INTO cart_items (user_id, product_id, quantity, spec) VALUES (2, 7, 3, 'NB号')`)
  db.run(`INSERT INTO cart_items (user_id, product_id, quantity, spec) VALUES (3, 15, 1, NULL)`)

  db.run(`INSERT INTO orders (user_id, total_amount, status, address, city, warehouse, payment_method) VALUES (2, 536, 'delivered', '上海市浦东新区世纪大道100号', '上海', '华东仓', 'wechat')`)
  db.run(`INSERT INTO orders (user_id, total_amount, status, address, city, warehouse, payment_method) VALUES (2, 267, 'shipped', '上海市浦东新区世纪大道100号', '上海', '华东仓', 'alipay')`)
  db.run(`INSERT INTO orders (user_id, total_amount, status, address, city, warehouse, payment_method) VALUES (3, 58, 'pending', '北京市朝阳区建国门外大街50号', '北京', '华北仓', 'wechat')`)

  db.run(`INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (1, 1, 2, 268, '1段')`)
  db.run(`INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (2, 2, 1, 248, '2段')`)
  db.run(`INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (2, 15, 1, 58, NULL)`)
  db.run(`INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (3, 15, 1, 58, NULL)`)

  db.run(`INSERT INTO logistics_records (order_id, status, description, location) VALUES (1, 'delivered', '已签收，签收人：本人', '上海浦东新区')`)
  db.run(`INSERT INTO logistics_records (order_id, status, description, location) VALUES (2, 'shipped', '运输中，预计6月10日送达', '上海转运中心')`)
  db.run(`INSERT INTO logistics_records (order_id, status, description, location) VALUES (2, 'packed', '已打包，等待发货', '华东仓')`)
  db.run(`INSERT INTO logistics_records (order_id, status, description, location) VALUES (3, 'created', '订单已创建，由华北仓发货', '华北仓')`)

  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '今天小萌第一次自己站起来了！太感动了，记录一下这个里程碑时刻~', '${imgBase}baby%20standing%20first%20time${imgSize}', '成长记录,里程碑', 32, 8)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '贝贝奶粉真的很不错，小帅喝了之后消化好了很多，推荐给大家！', '${imgBase}baby%20drinking%20milk%20happy${imgSize}', '好物推荐,奶粉', 18, 5)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '带小宝上了感统启蒙课，老师特别专业，孩子明显更喜欢运动了', '${imgBase}baby%20sensory%20class${imgSize}', '课程体验,感统训练', 25, 7)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '求推荐适合6个月宝宝的辅食食谱，小宝最近开始加辅食了', NULL, '辅食,求助', 12, 15)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '分享一个小窍门：用吹风机开低档吹背可以帮助宝宝缓解肠绞痛，亲测有效！', NULL, '育儿经验,肠绞痛', 45, 20)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '周末带娃去了亲子运动课，大人小孩都玩得很开心，推荐！', '${imgBase}parent%20child%20sports%20activity${imgSize}', '亲子活动,运动课', 22, 6)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '小萌今天打疫苗很勇敢，只哭了一下下就好了，妈妈为你骄傲！', '${imgBase}baby%20vaccine%20hospital${imgSize}', '疫苗,勇敢宝宝', 28, 9)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '贝贝纸尿裤真的超薄透气，用了很久一直没红屁股', '${imgBase}baby%20diapers%20product${imgSize}', '好物推荐,纸尿裤', 15, 4)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '有没有同月龄的妈妈一起交流育儿心得？我家宝宝14个月了', NULL, '交流,同龄宝宝', 8, 12)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '今天带小美做了第一次体检，一切指标正常，安心了', '${imgBase}baby%20health%20checkup${imgSize}', '体检,健康', 19, 5)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '尝试了贝贝果泥，宝宝很爱吃！口味清淡不会太甜，放心给娃吃', '${imgBase}baby%20fruit%20puree${imgSize}', '辅食,好物推荐', 14, 3)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '亲子阅读第30天打卡！小宝现在会自己翻书了，虽然还不会认字', '${imgBase}baby%20reading%20books${imgSize}', '亲子阅读,打卡', 36, 11)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '给宝宝做了一次南瓜泥，小萌特别爱吃，做法超简单分享给大家', '${imgBase}homemade%20baby%20pumpkin%20puree${imgSize}', '辅食食谱,南瓜泥', 41, 16)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (3, '参加了贝贝的创意绘画课体验，小宝的涂鸦太有想象力了哈哈', '${imgBase}baby%20painting%20artwork${imgSize}', '绘画课,创意', 30, 8)`)
  db.run(`INSERT INTO posts (user_id, content, images, tags, like_count, comment_count) VALUES (2, '夏天到了，给宝宝选防晒霜一定要选物理防晒！贝贝这款就很好用', '${imgBase}baby%20sunscreen%20outdoor${imgSize}', '防晒,夏季护理', 20, 6)`)

  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (1, 3, '太棒了！我家小宝还不会站呢，你们好厉害')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (1, 1, '成长的每一步都值得记录！')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (4, 2, '推荐贝贝有机米粉，我家宝宝很爱吃')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (4, 1, '可以从米粉开始，逐渐添加蔬菜泥和果泥')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (5, 3, '感谢分享！回去试试')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (5, 1, '注意温度不要太烫哦')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (7, 3, '小萌真勇敢！')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (9, 3, '我家宝宝15个月，可以一起交流！')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (12, 2, '坚持就是胜利！加油！')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (13, 3, '回去试试，我宝宝也该加辅食了')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (13, 1, '南瓜泥营养丰富，很适合宝宝')`)
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (14, 2, '哈哈小宝有艺术天赋！')`)

  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (1, 3)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (1, 1)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (3, 2)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (5, 3)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (5, 1)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (7, 3)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (12, 2)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (13, 3)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (13, 1)`)
  db.run(`INSERT INTO post_likes (post_id, user_id) VALUES (14, 2)`)

  db.run(`INSERT INTO insurance_products (name, type, coverage_amount, premium, age_min, age_max, description, features) VALUES ('贝贝安心少儿重疾险', '重疾险', 500000, 580, 0, 17, '覆盖120种重大疾病，确诊即赔，为宝宝健康保驾护航', '120种重疾保障|确诊即赔|保费低至48元/月|可续保至25岁')`)
  db.run(`INSERT INTO insurance_products (name, type, coverage_amount, premium, age_min, age_max, description, features) VALUES ('贝贝护童意外医疗险', '意外险', 100000, 198, 0, 17, '意外伤害+门急诊+住院医疗全方位保障', '意外伤害10万|门急诊1万|住院医疗5万|0免赔额|24小时生效')`)

  db.run(`INSERT INTO insurance_policies (user_id, product_id, insured_name, insured_id, premium, status, start_date, end_date) VALUES (2, 1, '小萌', '310115202403150021', 580, 'active', '2025-01-01', '2026-01-01')`)
  db.run(`INSERT INTO insurance_policies (user_id, product_id, insured_name, insured_id, premium, status, start_date, end_date) VALUES (2, 2, '小萌', '310115202403150021', 198, 'active', '2025-01-01', '2026-01-01')`)
  db.run(`INSERT INTO insurance_policies (user_id, product_id, insured_name, insured_id, premium, status, start_date, end_date) VALUES (3, 2, '小宝', '110105202408100013', 198, 'active', '2025-03-01', '2026-03-01')`)

  db.run(`INSERT INTO claims (policy_id, user_id, amount, description, status) VALUES (2, 2, 350, '门诊就诊，急性上呼吸道感染', 'approved')`)
  db.run(`INSERT INTO claims (policy_id, user_id, amount, description, status) VALUES (3, 3, 1200, '意外摔伤门诊+检查费用', 'initial_review')`)

  db.run(`INSERT INTO member_profiles (user_id, level, annual_spending, activity_score, points) VALUES (2, 'gold', 5680, 85, 5680)`)
  db.run(`INSERT INTO member_profiles (user_id, level, annual_spending, activity_score, points) VALUES (3, 'silver', 2350, 62, 2350)`)

  db.run(`INSERT INTO coupons (user_id, type, value, min_spend, status, expires_at) VALUES (2, 'discount', 50, 200, 'available', '2026-08-01')`)
  db.run(`INSERT INTO coupons (user_id, type, value, min_spend, status, expires_at) VALUES (2, 'discount', 30, 100, 'available', '2026-07-01')`)
  db.run(`INSERT INTO coupons (user_id, type, value, min_spend, status, expires_at) VALUES (2, 'cash', 20, 0, 'used', '2026-06-01')`)
  db.run(`INSERT INTO coupons (user_id, type, value, min_spend, status, expires_at) VALUES (3, 'discount', 50, 200, 'available', '2026-08-01')`)
  db.run(`INSERT INTO coupons (user_id, type, value, min_spend, status, expires_at) VALUES (3, 'cash', 10, 0, 'available', '2026-09-01')`)

  return db
}

export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function query(sql: string, params: any[] = []): any[] {
  const d = getDb()
  if (params.length > 0) {
    const stmt = d.prepare(sql)
    stmt.bind(params)
    const results: any[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  }
  const raw = d.exec(sql)
  if (!raw.length) return []
  return raw[0].values.map(row => {
    const obj: any = {}
    raw[0].columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
}

export function run(sql: string, params: any[] = []): { changes: number } {
  const d = getDb()
  d.run(sql, params)
  return { changes: d.getRowsModified() }
}

export function getLastInsertId(): number {
  const result = query('SELECT last_insert_rowid() as id')
  return result[0].id
}
