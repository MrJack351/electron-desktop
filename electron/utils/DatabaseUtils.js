const Storage = require('ee-core/storage');
const Log = require('ee-core/log');

class DatabaseUtils {
    constructor() {
        this.db = Storage.connection('session.db', {
            driver: 'sqlite',
            default: {
                timeout: 6000,
                // verbose: console.log // 打印sql语法
            }
        }).db;
        Log.info('数据库对象实例成功：', this.db);
    }

    // 创建表
    createTable(tableName, columns) {
        const columnsDefinition = Object.entries(columns)
            .map(([name, type]) => `${name} ${type}`)
            .join(', ');
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDefinition})`;
        this.db.prepare(sql).run();
        console.log(`表 ${tableName} 创建成功`);
    }

    // 插入数据
    insert(tableName, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

        const stmt = this.db.prepare(sql);
        const info = stmt.run(values);
        console.log(`数据插入成功，行ID为 ${info.lastInsertRowid}`);
        return info.lastInsertRowid;
    }

    // 查询数据
    select(tableName, conditions = {}) {
        let sql = `SELECT * FROM ${tableName}`;
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);

        if (keys.length > 0) {
            const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }

        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...values);
        return rows;
    }

    // 查询单条数据
    selectOne(tableName, conditions = {}) {
        let sql = `SELECT * FROM ${tableName}`;
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);

        if (keys.length > 0) {
            const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }

        const stmt = this.db.prepare(sql);
        const row = stmt.get(...values);
        return row;
    }

    // 更新数据
    update(tableName, data, conditions = {}) {
        const updates = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const values = [...Object.values(data)];

        let whereClause = '';
        if (Object.keys(conditions).length > 0) {
            whereClause = 'WHERE ' + Object.keys(conditions)
                .map((key) => `${key} = ?`)
                .join(' AND ');
            values.push(...Object.values(conditions));
        }

        const sql = `UPDATE ${tableName} SET ${updates} ${whereClause}`;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...values);
        console.log(`更新成功，受影响的行数为 ${info.changes}`);
        return info.changes;
    }

    // 删除数据
    delete(tableName, conditions) {
        const whereClause = Object.keys(conditions)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const values = Object.values(conditions);
        const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;

        const stmt = this.db.prepare(sql);
        const info = stmt.run(...values);
        console.log(`删除成功，受影响的行数为 ${info.changes}`);
        return info.changes;
    }
    // 获取现有表的字段信息
    getExistingColumns(tableName) {
        try {
            const result = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
            if (result.length === 0) {
                return null;
            }
            const columns = {};
            result.forEach(row => {
                columns[row.name] = row.type;
            });
            return columns;
        } catch (error) {
            console.error(`Failed to fetch columns for table ${tableName}:`, error);
            return null;
        }
    }

    // 更新表的字段（增加或删除）
    updateTableColumns(tableName, definedColumns, existingColumns) {
        // 添加不存在的字段
        for (const [columnName, columnType] of Object.entries(definedColumns)) {
            if (!(columnName in existingColumns)) {
                const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
                this.db.prepare(sql).run();
                console.log(`Added column ${columnName} to table ${tableName}.`);
            }
        }

        // 删除多余的字段
        for (const existingColumn of Object.keys(existingColumns)) {
            if (!(existingColumn in definedColumns)) {
                console.warn(`Column ${existingColumn} exists in ${tableName} but is not defined in schema. Consider removing it manually if not needed.`);
                // SQLite 不支持直接删除列，通常建议创建一个新表然后迁移数据
            }
        }
    }

    // 同步表结构
    async syncTableStructure(tableName, definedColumns, constraints = []) {
        const existingColumns = this.getExistingColumns(tableName);

        if (existingColumns === null) {
            // 表不存在，直接创建
            await this.createTable(tableName, definedColumns, constraints);
            console.log(`表 ${tableName} 不存在，已自动创建`);
        } else {
            // 表已存在，检查字段并更新
            await this.updateTableColumns(tableName, definedColumns, existingColumns);
        }
    }

    // 关闭数据库
    close() {
        this.db.close();
        console.log('数据库连接已关闭');
    }
}

module.exports = DatabaseUtils;
