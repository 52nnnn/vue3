<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入姓名或电话"
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="success" @click="openAddDialog">添加</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="filteredTableData"
      border
      style="width: 100%"
      v-loading="loading"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55" />

      <!-- 数据列 -->
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="name" label="姓名" width="120" sortable="custom" />
      <el-table-column prop="tel" label="电话" width="150" sortable="custom" />
      <el-table-column prop="address" label="地址" sortable="custom" />

      <!-- 操作列 -->
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 空数据提示 -->
    <el-empty v-if="filteredTableData.length === 0" description="暂无数据" />

    <!-- 添加对话框 -->
    <el-dialog v-model="dialogVisible" title="添加数据" width="30%">
      <el-form :model="newData" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="newData.name" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="newData.tel" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="newData.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  setup() {
    const tableData = ref([]); // 原始表格数据
    const filteredTableData = ref([]); // 过滤后的表格数据
    const currentPage = ref(1); // 当前页码
    const pageSize = ref(10); // 每页显示条数
    const total = ref(0); // 总条数
    const loading = ref(false); // 加载状态
    const searchKeyword = ref(''); // 搜索关键字
    const sortProp = ref(''); // 排序字段
    const sortOrder = ref(''); // 排序顺序
    const dialogVisible = ref(false); // 添加对话框可见性
    const newData = ref({ name: '', tel: '', address: '' }); // 新数据
    const selectedRows = ref([]); // 选中的行

    // 从接口获取数据
    const fetchData = async () => {
      loading.value = true;
      try {
        const response = await axios.get(
          'https://mock.apipost.net/mock/3827cad7147c000/mock/3827cad7147c000/?apipost_id=694a5c17d103e'
        );
        tableData.value = response.data.data;
        total.value = tableData.value.length;
        filterAndSortData();
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 过滤和排序数据
    const filterAndSortData = () => {
      let data = tableData.value;

      // 搜索过滤
      if (searchKeyword.value) {
        data = data.filter(
          (item) =>
            item.name.includes(searchKeyword.value) ||
            item.tel.includes(searchKeyword.value)
        );
      }

      // 排序
      if (sortProp.value && sortOrder.value) {
        data.sort((a, b) => {
          if (sortOrder.value === 'ascending') {
            return a[sortProp.value] > b[sortProp.value] ? 1 : -1;
          } else {
            return a[sortProp.value] < b[sortProp.value] ? 1 : -1;
          }
        });
      }

      // 分页
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      filteredTableData.value = data.slice(start, end);
    };

    // 搜索
    const handleSearch = () => {
      currentPage.value = 1;
      filterAndSortData();
    };

    // 分页切换
    const handlePageChange = (page) => {
      currentPage.value = page;
      filterAndSortData();
    };

    // 每页条数切换
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      filterAndSortData();
    };

    // 排序
    const handleSortChange = ({ prop, order }) => {
      sortProp.value = prop;
      sortOrder.value = order;
      filterAndSortData();
    };

    // 编辑操作
    const handleEdit = (row) => {
      console.log('编辑行:', row);
    };

    // 删除操作
    const handleDelete = (row) => {
      ElMessageBox.confirm('确定删除该行数据吗？', '提示', {
        type: 'warning',
      }).then(() => {
        tableData.value = tableData.value.filter((item) => item.id !== row.id);
        filterAndSortData();
        ElMessage.success('删除成功');
      }).catch(() => {});
    };

    // 批量删除
    const handleBatchDelete = () => {
      ElMessageBox.confirm('确定删除选中的数据吗？', '提示', {
        type: 'warning',
      }).then(() => {
        tableData.value = tableData.value.filter(
          (item) => !selectedRows.value.includes(item)
        );
        filterAndSortData();
        ElMessage.success('删除成功');
        selectedRows.value = []; // 清空选中行
      }).catch(() => {});
    };

    // 添加数据
    const handleAdd = () => {
      tableData.value.push({
        id: tableData.value.length + 1,
        ...newData.value,
      });
      dialogVisible.value = false;
      filterAndSortData();
      ElMessage.success('添加成功');
      newData.value = { name: '', tel: '', address: '' }; // 清空表单
    };

    // 打开添加对话框
    const openAddDialog = () => {
      dialogVisible.value = true;
    };

    // 选中行变化
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows;
    };

    // 初始化加载数据
    onMounted(() => {
      fetchData();
    });

    return {
      tableData,
      filteredTableData,
      currentPage,
      pageSize,
      total,
      loading,
      searchKeyword,
      dialogVisible,
      newData,
      selectedRows,
      handleSearch,
      handlePageChange,
      handleSizeChange,
      handleSortChange,
      handleEdit,
      handleDelete,
      handleBatchDelete,
      handleAdd,
      openAddDialog,
      handleSelectionChange,
    };
  },
};
</script>
  
<style scoped>
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #f9f9f9;
}

.el-table__body tr:hover > td {
  background-color: #f1f1f1 !important;
}

.el-table__header th {
  background-color: #409eff;
  color: white;
  font-weight: bold;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}

.el-button {
  margin-right: 10px;
}

.el-empty {
  margin-top: 20px;
}

/* 操作列按钮布局 */
.el-table-column--operation .el-button {
  margin-right: 8px;
}
</style>