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
    };//搜索条件封装对象

    //搜索
    $scope.search = function () {
        $scope.searchMap.pageNo = parseInt($scope.searchMap.pageNo);//将页码转换为 int类型
        searchService.search($scope.searchMap).success(
            function (response) {
                $scope.resultMap = response;
                buildPageLabel();//调用分页方法
            }
        );
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

    //撤销搜索项
    $scope.removeSearchItem = function (key) {
        if (key == 'category' || key == 'brand' || key == 'price') {//如果用户点击的是分类或者品牌
            $scope.searchMap[key] = "";
        } else {//规格是用户点击的
            delete $scope.searchMap.spec[key];
        }
        $scope.search();//查询
    };
    //构建分页标签(totalPages为总页数)
    buildPageLabel = function () {
        $scope.pageLabel = [];//新增分页栏属性
        var maxPageNo = $scope.resultMap.totalPages;//得到最后页码
        var firstPage = 1;//开始页码
        var lastPage = maxPageNo;//截止页码

        //显示省略号
        $scope.firstDot = true;//为true 前边 有点
        $scope.lastDot = true;//为true 后边 有点

        if ($scope.resultMap.totalPages > 5) {//如果总页数大于5页,显示部分页码
            if ($scope.searchMap.pageNo <= 3) {//如果当前页小于等于3
                lastPage = 5;//前5页
                $scope.firstDot = false;//小于五页前面没点
            } else if ($scope.searchMap.pageNo >= lastPage - 2) {//如果当前页大于等于最大页码-2
                firstPage = maxPageNo - 4;//后5 页
                $scope.lastDot = false;//后面小于五页也没点
            } else {//显示当前页为中心的5页
                firstPage = $scope.searchMap.pageNo - 2;
                lastPage = $scope.searchMap.pageNo + 2;
            }
        }else {//总页数小于5
            $scope.firstDot = false;//为false 前边 没点
            $scope.lastDot = false;//为false 后边 没点
        }
        //循环产生页码标签
        for (var i = firstPage; i <= lastPage; i++) {
            $scope.pageLabel.push(i);
        }
    };
    //根据页码查询
    $scope.queryByPage = function (pageNo) {
        //页码验证
        if (pageNo < 1 || pageNo > $scope.resultMap.totalPages) {
            return;
        }
        $scope.searchMap.pageNo = pageNo;
        $scope.search();//查询
    };
});