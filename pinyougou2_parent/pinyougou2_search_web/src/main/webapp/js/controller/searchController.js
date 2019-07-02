app.controller('searchController', function ($scope, searchService) {

    //定义搜索对象的结构 category : 商品分类
    $scope.searchMap = {'keywords': '', 'category': '', 'brand': '', 'spec': {'': ''}};

    //搜索
    $scope.search = function () {
        searchService.search($scope.searchMap).success(
            function (response) {
                $scope.resultMap = response;
            }
        );
    };

    //添加搜索项,改变searchMap的值
    $scope.addSerach = function () {

    }
});