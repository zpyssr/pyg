//文件上传服务器
app.service('uploadService', function ($http) {
    this.uploadFile = function () {
        var formData = new FormData();
        formData.append("file", file.files[0]);//file代表的是文件上传框name
        return $http({
            method: 'post',
            url: "../upload.do",
            data: formData,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        });
    };
});
