import { itemHeight, maxLevel, nodeWidth } from "./registerShape";
import { LineageData, LineageItem } from "../types";

// 自定义数据转换
export const transformData = (data: LineageData[]) => {
  const nodes: any[] = [];
  // 用 map 实现对象去重
  const edgeMap: Map<string, any> = new Map();
  // 用 set 实现表名去重
  const tableFields: Set<any> = new Set();

  data.forEach((item: LineageData) => {
    const targetField = item.targetField;
    const tableField = handleTableField(targetField);
    tableFields.add(tableField);
    if (item.refFields) {
      createEdge(edgeMap, tableFields, tableField, item.refFields);
    }
  });

  createNode(nodes, tableFields);
  const edges = Array.from(edgeMap.values());

  return {
    nodes,
    edges,
  };
};

/**
 * 创建 Edge 即连线即字段之间的连线
 */
const createEdge = (
  edgeMap: Map<string, any>,
  tableFields: Set<any>,
  tableField: string,
  refFields: LineageItem[]
) => {
  const target = getTableFieldName(tableField);
  const targetName = target.tableName;
  const targetAnchor = target.tableField;
  refFields.forEach((ref: any) => {
    const tableField = handleTableField(ref);
    tableFields.add(tableField);

    const source = getTableFieldName(tableField);
    const sourceName = source.tableName;
    const sourceAnchor = source.tableField;
    // 不能自连，防止绘制失败
    if (targetName === sourceName) {
      return;
    }

    const edge: any = {};
    edge.source = sourceName;
    edge.sourceAnchor = sourceAnchor;
    edge.target = targetName;
    edge.targetAnchor = targetAnchor;
    edge.label = ref.label;
    let key = sourceName + sourceAnchor + "-" + targetName + targetAnchor;
    edgeMap.set(key, edge);
  });
};

/**
 * 拼接表名+字段，逻辑可参考文档
 */
const handleTableField = (item: any) => {
  const fieldName = item.fieldName;
  let tableField = "";
  if (item.final) {
    tableField = fieldName;
  } else {
    if (item.level === undefined) {
      tableField = `${fieldName}`;
    } else {
      tableField = `${item.level}-${0}:${fieldName}`;
    }
  }
  return tableField;
};

/**
 * 拆分字符串获取表名称，字段名称
 */
const getTableFieldName = (item: string) => {
  const names: string[] = item.split(":");
  let tableName = "";
  let tableField = "";
  if (names.length === 1) {
    const array = names[0].split(".");
    tableName = array[1];
    tableField = array[2];
  } else {
    const array = names[1].split(".");
    tableName = array[1] + "_" + names[0];
    tableField = array[2];
  }
  return { tableName, tableField };
};

/**
 * 获取表层级及order
 */
const getTableLevelAndOrder = (tableField: string) => {
  let level = maxLevel;
  let order = 0;

  const reg = /\$\$[^$]*\$\$/g;
  const match = tableField.match(reg);
  if (match) {
    const array = match[0].split(",");
    level = Number(array[1].replace("$$", ""));
  }
  return { level, order };
};

/**
 * 创建 Node 即节点即表
 */
const createNode = (nodes: any[], tableFields: Set<any>) => {
  const tables: Map<string, string[]> = new Map();
  tableFields.forEach((item: any) => {
    const table = getTableFieldName(item);
    const tableName = table.tableName;
    const tableField = table.tableField;

    if (!tables.has(tableName)) {
      tables.set(tableName, [tableField]);
    } else {
      const attrs: any = tables.get(tableName);
      if (!attrs?.includes(tableField)) {
        attrs?.push(tableField);
        tables.set(tableName, attrs);
      }
    }
  });

  tables.forEach((value: string[], key: any, _map) => {
    const attrs: any[] = [];
    value.forEach((attr: any) => {
      attrs.push({
        nodeId: key,
        key: attr,
        type: "",
      });
    });

    const { level, order } = getTableLevelAndOrder(key);
    const height = itemHeight * (attrs.length + 1);
    const obj: any = {
      id: key,
      key: key,
      label: key.replace(/\$\$[^$]*\$\$/g, ""),
      x: 100,
      y: 100,
      level: level,
      order: order,
      attrs: attrs,
      size: [nodeWidth, height],
    };
    nodes.push(obj);
  });
};

/**
 * 处理表级数据，即当字段级血缘关系为 false 时
 */
export const collapseData = (data: any) => {
  const nodes: any[] = [];
  const edgeMap: Map<string, any> = new Map();
  const tableFields: Set<any> = new Set();

  data.forEach((item: any) => {
    const targetField = item.targetField;
    const tableField = handleTableField(targetField);
    tableFields.add(tableField);

    if (item.refFields) {
      createCollapsedEdge(edgeMap, tableFields, tableField, item.refFields);
    }
  });

  const edges = Array.from(edgeMap.values());
  createCollapsedNode(nodes, tableFields);

  return {
    nodes,
    edges,
  };
};

const createCollapsedEdge = (
  edgeMap: Map<string, any>,
  tableFields: Set<any>,
  tableField: string,
  refFields: any[]
) => {
  const target = getTableFieldName(tableField);
  const targetName = target.tableName;
  refFields.forEach((ref: any) => {
    const tableField = handleTableField(ref);
    tableFields.add(tableField);
    const source = getTableFieldName(tableField);
    const sourceName = source.tableName;
    // 不能自连，防止绘制失败
    if (targetName === sourceName) {
      return;
    }

    const edge: any = {};
    edge.source = sourceName;
    edge.sourceAnchor = sourceName;
    edge.target = targetName;
    edge.targetAnchor = targetName;
    edge.label = ref.label;
    let key = sourceName + "-" + targetName;
    edgeMap.set(key, edge);
  });
};

const createCollapsedNode = (nodes: any[], tableFields: Set<any>) => {
  const tables: Set<string> = new Set();
  tableFields.forEach((item: any) => {
    const table = getTableFieldName(item);
    const tableName = table.tableName;
    tables.add(tableName);
  });

  tables.forEach((key: string, _value: any) => {
    const { level, order } = getTableLevelAndOrder(key);
    const obj: any = {
      id: key,
      key: key,
      label: key.replace(/\$\$[^$]*\$\$/g, ""),
      x: 100,
      y: 100,
      level: level,
      order: order,
      attrs: [],
      size: [nodeWidth, itemHeight],
    };
    nodes.push(obj);
  });
};

/**
 * 获取选中 label 的所有左关联边
 * @param edges node 的所有 edges
 * @param model node 的 model
 * @param sourceAnchor 选中的 label
 * @param leftActiveEdges 左关联边集合
 */
export const getLeftRelation = (
  edges: any[],
  model: any,
  sourceAnchor: any,
  leftActiveEdges: any[]
) => {
  const source = model["id"]; // 当前节点
  edges
    .filter((edge: any) => !leftActiveEdges.includes(edge))
    .forEach((edge: any) => {
      if (
        edge.getModel()["target"] === source &&
        edge.getModel()["targetAnchor"] === sourceAnchor
      ) {
        leftActiveEdges.push(edge);

        const currentNode = edge.getSource();
        const currentModel = currentNode.getModel();
        const currentEdges = currentNode.getInEdges();
        const currentSourceAnchor = edge.getModel()["sourceAnchor"];
        getLeftRelation(
          currentEdges,
          currentModel,
          currentSourceAnchor,
          leftActiveEdges
        );
      }
    });
};

/**
 * 获取选中 label 的所有右关联边
 * @param edges node 的所有 edges
 * @param model node 的 model
 * @param sourceAnchor 选中的 label
 * @param rightActiveEdges 右关联边集合
 */
export const getRightRelation = (
  edges: any[],
  model: any,
  sourceAnchor: any,
  rightActiveEdges: any[]
) => {
  const source = model["id"]; // 当前节点
  edges
    .filter((edge: any) => !rightActiveEdges.includes(edge))
    .forEach((edge: any) => {
      if (
        edge.getModel()["source"] === source &&
        edge.getModel()["sourceAnchor"] === sourceAnchor
      ) {
        rightActiveEdges.push(edge);

        const currentNode = edge.getTarget();
        const currentModel = currentNode.getModel();
        const currentEdges = currentNode.getOutEdges();
        const currentTargetAnchor = edge.getModel()["targetAnchor"];
        getRightRelation(
          currentEdges,
          currentModel,
          currentTargetAnchor,
          rightActiveEdges
        );
      }
    });
};

export const transformBoold = ({ relationData }: any) => {
  const array = [] as any[];

  relationData.forEach((item: any) => {
    let targetField = {};
    let refFields = [];

    if (item.targetColumns?.length) {
      targetField = {
        id:
          item.targetColumns[0].columnName +
          "_" +
          item.targetColumns[0].columnId,
        fieldName:
          "default." +
          item.targetColumns[0].columnParentName +
          "$$" +
          item.targetColumns[0].columnParentId +
          "," +
          item.targetColumns[0].level +
          "$$" +
          "." +
          item.targetColumns[0].columnName,
      };
    }
    if (item.sourceColumns?.length) {
      refFields = item.sourceColumns.map((source: any) => {
        return {
          id: source.columnName + "_" + source.columnId,
          fieldName:
            "default." +
            source.columnParentName +
            "$$" +
            source.columnParentId +
            "," +
            source.level +
            "$$" +
            "." +
            source.columnName,
        };
      });
    }

    array.push({
      targetField,
      refFields,
    });
  });

  return array;
};

/**
 * 解析xml数据
 * @param xml node 的所有 edges
 * @returns 解析后的数据
 */
export const parseXml = (
  xml: string,
  option = {
    _table: "table", // 表标识
    _midTable: "rs", // 中间表标识
    _endTable: "re", // 结束表标识
    _relation: "relation", // 关系标识
    _relationId: "id", // 关系id标识
    _column: "column", // 字段标识
    _tableId: "id", // 表id标识
    _tableName: "name", // 表名标识
    _columnId: "id", // 字段id标识
    _columnName: "name", // 字段名标识
    _target: "target", // 目标字段标识
    _source: "source", // 源字段标识
    _targetId: "columnId", // 目标字段id标识
    _sourceId: "columnId", // 源字段id标识
    _targetName: "columnName", // 目标字段名标识
    _sourceName: "columnName", // 源字段名标识
  }
) => {
  const {
    _table,
    _midTable,
    _endTable,
    _relation,
    _relationId,
    _column,
    _tableId,
    _tableName,
    _columnId,
    _columnName,
    _target,
    _source,
    _targetId,
    _sourceId,
    _targetName,
    _sourceName,
  } = option;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const tables = xmlDoc.getElementsByTagName(_table);
  const midTables = xmlDoc.getElementsByTagName(_midTable);
  const endTables = xmlDoc.getElementsByTagName(_endTable);
  const relations = xmlDoc.getElementsByTagName(_relation);

  // 表数据
  const tableData = Array.from(tables).map((table) => {
    const tableId = table.getAttribute(_tableId);
    const tableName = table.getAttribute(_tableName);
    const tableColumns = Array.from(table.getElementsByTagName(_column)).map(
      (column) => {
        const columnName = column.getAttribute(_columnName);
        const columnId = column.getAttribute(_columnId);

        return { columnName, columnId };
      }
    );
    return { tableId, tableName, tableColumns, level: 0 };
  });

  // 中间表数据
  const midTableData = Array.from(midTables).map((midTable) => {
    const tableId = midTable.getAttribute(_tableId);
    const tableName = midTable.getAttribute(_tableName);
    const tableColumns = Array.from(midTable.getElementsByTagName(_column)).map(
      (column) => {
        const columnName = column.getAttribute(_columnName);
        const columnId = column.getAttribute(_columnId);

        return { columnName, columnId };
      }
    );
    return { tableId, tableName, tableColumns, level: 1 };
  });

  // 结束表数据
  const endTableData = Array.from(endTables).map((endTable) => {
    const tableId = endTable.getAttribute(_tableId);
    const tableName = endTable.getAttribute(_tableName);
    const tableColumns = Array.from(endTable.getElementsByTagName(_column)).map(
      (column) => {
        const columnName = column.getAttribute(_columnName);
        const columnId = column.getAttribute(_columnId);

        return { columnName, columnId };
      }
    );
    return { tableId, tableName, tableColumns, level: 2 };
  });

  // 关系数据
  const relationData = Array.from(relations).map((relation) => {
    const relationId = relation.getAttribute(_relationId);

    const targetColumns = Array.from(
      relation.getElementsByTagName(_target)
    ).map((column) => {
      const columnName = column.getAttribute(_targetName);
      const columnId = column.getAttribute(_targetId);

      const findData = [...tableData, ...midTableData, ...endTableData].find(
        (item) => {
          return item.tableColumns.find((column) => {
            return column.columnId === columnId;
          });
        }
      );
      const columnParentId = findData?.tableId;
      const columnParentName = findData?.tableName;
      const level = findData?.level;

      return {
        columnName,
        columnId,
        columnParentId,
        columnParentName,
        level,
      };
    });

    const sourceColumns = Array.from(
      relation.getElementsByTagName(_source)
    ).map((column) => {
      const columnName = column.getAttribute(_sourceName);
      const columnId = column.getAttribute(_sourceId);
      const findData = [...tableData, ...midTableData, ...endTableData].find(
        (item) => {
          return item.tableColumns.find((column) => {
            return column.columnId === columnId;
          });
        }
      );
      const columnParentId = findData?.tableId;
      const columnParentName = findData?.tableName;
      const level = findData?.level;

      return {
        columnName,
        columnParentId,
        columnParentName,
        columnId,
        level,
      };
    });

    return { relationId, targetColumns, sourceColumns };
  });

  return { tableData, midTableData, endTableData, relationData };
};
