app.controller("brandController", function ($scope, $http, brandService) {
    $scope.findAll = function () {
        brandService.findAll().success(
            function (response) {
                $scope.list = response;
            }
        );
    };
    //分页控件配置
    //currentPage 当前页
    //totalPage 总记录数
    //itemsPerPage 每页记录数
    //perPageOptions 分页选项
    //onChange 当页码重新变更后,自动触发的方法
    $scope.paginationConf = {
        currentPage: 1,
        totalPage: 10,
        itemsPerPage: 10,
        perPageOptions: [10, 20, 30, 40, 50],
        onChange: function () {
            $scope.reloadList();
        }
    };
    //刷新列表
    $scope.reloadList = function () {
        // $scope.findPage($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage)
        $scope.search($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage)
    };
    //分页
    $scope.findPage = function (page, rows) {
        brandService.findPage(page, rows).success(
            function (response) {
                $scope.list = response.rows;//显示当前页数据
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    };
    //新增
    $scope.save = function () {
        var object = null;
        if ($scope.entity.id != null) {
            object = brandService.update($scope.entity);
        } else {
            object = brandService.add($scope.entity);
        }
        object.success(
            function (response) {
                if (response.success) {
                    $scope.reloadList();//刷新页面
                    // alert(response.message);//弹出添加成功弹窗 /* TODO */
                } else {
                    alert(response.message);
                }
            }
        );
    };
    //查询实体
    $scope.findOne = function (id) {
        brandService.findOne(id).success(
            function (response) {
                $scope.entity = response;
            }
        );
    };
    //删除品牌
    //思路整理
    //$event 是一个圆,指的是input本身
    $scope.selectIds = [];//用户勾选的id集合
    $scope.updateSelection = function ($event, id) {
        //只有被选中的时候才添加到ids集合中
        if ($event.target.checked) {
            $scope.selectIds.push(id);//push向集合中添加元素
        } else {
            //如果没被选中则删除集合中的元素
            var index = $scope.selectIds.indexOf(id);//查找值的位置
            $scope.selectIds.splice(index, 1);//参数1:移除的位置 参数2:移除的个数
        }
    };
    //用户删除
    $scope.dele = function () {
        brandService.dele($scope.selectIds).success(
            function (response) {
                if (response.success) {
                    $scope.reloadList();//成功就刷新
                } else {
                    alert(response.message);
                }
            }
        )
    };
    //条件查询
    $scope.searchEntity = {};//初始化
    $scope.search = function (page, size) {
        brandService.search(page, size, $scope.searchEntity).success(
            function (response) {
                $scope.list = response.rows;//显示当前页数据
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        )
    }
});