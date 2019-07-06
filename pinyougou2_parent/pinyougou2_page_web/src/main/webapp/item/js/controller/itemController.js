//商品详情页(控制层)
app.controller('itemController', function ($scope) {
    //数量操作
    $scope.addNum = function (x) {
        $scope.num = $scope.num + x;
        if ($scope.num < 1) {
            $scope.num = 1;
        }
    };

});