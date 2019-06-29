app.controller('baseController', function ($scope) {
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
    $scope.jsonToString = function (jsonString, key) {
        var json = JSON.parse(jsonString);
        var value = "";
        for (var i = 0; i < json.length; i++) {
            if (i > 0) {
                value += "，"
            }
            value += json[i][key];
        }
        return value;
    };
    //从集合中按照key查询对象
    $scope.searchObjectByKey = function (list, key, keyValue) {
        for (var i = 0; i < list.length; i++) {
            if (list[i][key] == keyValue) {
                return list[i];
            }
        }
        return null;
    }
});