//商品详情页(控制层)
app.controller('itemController', function ($scope) {
    //数量操作
    $scope.addNum = function (x) {
        $scope.num = $scope.num + x;
        if ($scope.num < 1) {
            $scope.num = 1;
        }
    };

    //记录用户选择的数据
    $scope.sepcificationItems = {};
    //用户选择规格
    $scope.selectSpecification = function (name, value) {
        $scope.sepcificationItems[name] = value;
    };
    //判断某规格选项是否被用户选中
    $scope.isSelected = function (name, value) {
        if ($scope.sepcificationItems[name] == value) {
            return true;
        } else {
            return false;
        }
    };

});