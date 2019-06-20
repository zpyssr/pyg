app.controller("brandController", function ($scope, $http, $controller, brandService) {
    //继承
    //伪继承 {$scope: $scope} 意思是把baseController和brandController中的$scope链接起来
    //$controller 也需要传递,需要在参数中注入
    $controller('baseController', {$scope: $scope});
    $scope.findAll = function () {
        brandService.findAll().success(
            function (response) {
                $scope.list = response;
            }
        );
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