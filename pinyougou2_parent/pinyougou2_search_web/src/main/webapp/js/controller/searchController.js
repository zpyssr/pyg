app.controller('searchController', function ($scope, searchService) {

    //定义搜索对象的结构 category : 商品分类
    $scope.searchMap = {
        'keywords': '',
        'category': '',
        'brand': '',
        'spec': {},
        'price': '',
        'pageNo': 1,
        'pageSize': 40
    };

    //搜索
    $scope.search = function () {
        $scope.searchMap.pageNo = parseInt($scope.searchMap.pageNo);//转换为数字
        searchService.search($scope.searchMap).success(
            function (response) {
                $scope.resultMap = response;
                buildPageLabel();//构建分页栏
            }
        );
    };

    //构建分页栏
    buildPageLabel = function () {
        //构建分页栏
        $scope.pageLabel = [];
        var firstPage = 1;//开始页码
        var lastPage = $scope.resultMap.totalPages;//截止页码
        if ($scope.resultMap.totalPages > 5) {//如果页码数量大于5
            if ($scope.searchMap.pageNo <= 3) {//如果当前页码小于等于3
                lastPage = 5;
            } else if ($scope.searchMap.pageNo >= $scope.resultMap.totalPages - 2) {
                firstPage = $scope.resultMap.totalPages - 4;
            } else { // 显示已当前页为中心的五页
                firstPage = $scope.searchMap.pageNo - 2;
                lastPage = $scope.searchMap.pageNo + 2;
            }
        }
        //构建页码
        for (var i = firstPage; i <= lastPage; i++) {
            $scope.pageLabel.push(i);
        }
    };

    //添加搜索项,改变searchMap的值
    $scope.addSearchItem = function (key, value) {
        if (key == 'category' || key == 'brand' || key == 'price') {//如果用户点击的是分类或者品牌
            $scope.searchMap[key] = value;
        } else {//规格是用户点击的
            $scope.searchMap.spec[key] = value;
        }
        $scope.search();//查询
    };

    //分页查询
    $scope.queryByPage = function (pageNo) {
        if (pageNo < 1 || pageNo > $scope.resultMap.totalPages) {
            return;
        }
        $scope.searchMap.pageNo = pageNo;
        $scope.search();//查询
    };

    //撤销搜索项
    $scope.removeSearchItem = function (key) {
        if (key == 'category' || key == 'brand' || key == 'price') {//如果用户点击的是分类或者品牌
            $scope.searchMap[key] = "";
        } else {//规格是用户点击的
            delete $scope.searchMap.spec[key];
        }
        $scope.search();//查询
    };
});