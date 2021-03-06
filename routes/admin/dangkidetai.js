/**
 * Created by Admin on 20/11/2016.
 */
var express = require('express');
var router = express.Router();
var utility = require('../../Utility/utility')
var models = require('../../models');
var XLSX = require('xlsx');
var multipart  = require('connect-multiparty');
var multipartMiddleware = multipart();
var validator = require('validator')
var exportFile = require('../../Utility/exportFIle')
var nodemailer = require('nodemailer');
var fs = require('fs')
var smtpTransport = {
    host: "ctmail.vnu.edu.vn", // hostname
    secure: false, // use SSL
    port: 25, // port for secure SMTP
    auth: {
        user: "14020521",
        pass: "1391996"
    },
    tls: {
        rejectUnauthorized: false
    }
}
var transporter = nodemailer.createTransport(smtpTransport);

//update sinh vien duoc dang ký băng tay
router.post('/updatesinhvienbyid',utility.reqIsAuthen,utility.reqIsKhoa,function (req,res) {
    if(req.body.id){
        var id = req.body.id
        if(validator.isInt(id.toString())&&!validator.isEmpty(id.toString())){
            models.SinhVien.updateSinhVienDuocDangKiByID(req.body.id,function () {
                res.json({
                    msg : "Update thanh cong",
                    status : 200
                })
            },function () {
                res.json({
                    msg : "Update that bai",
                    status : 500
                })
            })
        }
    }else{
        res.json({
            msg : "Update that bai",
            status : 500
        })
    }

})
/*
 * Thay đổi trang thai tu ko đc dang kí thanh duoc dang ki
 * */
router.post('/updatesinhvien',utility.reqIsAuthen,
    utility.reqIsKhoa,
    multipartMiddleware,
    getArrayFromXlsx,
    updateSinhVienDuocDangki,
    function (req, res) {
        res.json({
            msg: "Insert thanh cong"
        })
    }
)
//Gui mail đén tất cả các sinh viên có trạng thái được đăng kí
router.get('/sendmailtosinhvienduocdangki',utility.reqIsAuthen,utility.reqIsKhoa,function (req,res) {
    models.SinhVien.getSinhVienDuocDangKiKhoaLuan(function (sv) {
        if(sv){
            var listEmail = "";
            for(var i=0;i<sv.length;i++){
                if(i==sv.length -1){
                    listEmail += sv[i].vnuMail
                }else
                    listEmail += sv[i].vnuMail + ' ,'
            }
            // setup e-mail data with unicode symbols
            //noi dung mail nhe
            var mailOptions = {
                from: '"Hệ thống đăng ký khóa luận" <14020521@vnu.edu.vn>', // sender address
                // to: listEmail, // list of receivers
                to : '14020477@vnu.edu.vn',
                subject: 'Hệ thống đăng kí khóa luận', // Subject line
                text: 'Hệ thống thông báo, Bạn đã được phép đăng kí khóa luận trên hệ thống\n Trân trọng thông báo!'
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    res.json({
                        msg : "gửi mail thất bại"
                    })
                }else
                    res.json({
                        msg:"gửi mail thành công"
                    })
            });
        }
    },function (err) {
        res.json({
            msg: "Hệ thống có lỗi, vui lòng kiểm tra lại"
        })
    })

})
//test mo cong dang ki khoa luan
router.get('/testopenport',utility.reqIsAuthen,utility.reqIsKhoa,utility.checkOpenPortDK,function (req,res) {
    var openPortDK = require('../../config/config_Khoa_moDangKi.json');
    switch ('fit'){
        case 'fit':{
            res.json({
                trangthai : openPortDK.fit
            })
            break;
        }
        case 'fet':{
            res.json({
                trangthai : openPortDK.fet
            })
            break;
        }
        case 'fema':{
            res.json({
                trangthai : openPortDK.fema
            })
            break;
        }
        case 'fepn':{
            res.json({
                trangthai : openPortDK.fepn
            })
            break;
        }
    }

})

router.get('/openorclosedk',utility.reqIsAuthen,utility.reqIsKhoa,function (req,res) {
    var openPortDK = require('../../config/config_Khoa_moDangKi.json');
    switch (req.user.id){
        case 'fit':{
            if (openPortDK.fit){
                res.json({
                    status : "open"
                })
            }else{
                res.json({
                    status : "close"
                })
            }
            break;
        }
        case 'fet':{
            if (openPortDK.fet){
                res.json({
                    status : "open"
                })
            }else{
                res.json({
                    status : "close"
                })
            }
            break;
        }
        case 'fema':{
            if (openPortDK.fema){
                res.json({
                    status : "open"
                })
            }else{
                res.json({
                    status : "close"
                })
            }
            break;
        }
        case 'fepn':{
            if (openPortDK.fepn){
                res.json({
                    status : "open"
                })
            }else{
                res.json({
                    status : "close"
                })
            }
            break;
        }
    }
})
//Mo hoac dong cong dang ki
//van dang dung body.id ==> phai chuyen sang user.id
router.post('/openportdk',utility.reqIsAuthen,utility.reqIsKhoa,function (req,res) {
    var openPortDK = require('../../config/config_Khoa_moDangKi.json');
    if(req.body.permission){
        if(req.body.permission == 'open'){
            switch (req.user.id){
                case 'fit':{
                    openPortDK.fit = true;
                    break;
                }
                case 'fet':{
                    openPortDK.fet = true;
                    break;
                }
                case 'fema':{
                    openPortDK.fema = true;
                    break;
                }
                case 'fepn':{
                    openPortDK.fepn = true;
                    break;
                }
            }
            res.json({
                msg: 'đã mở cổng đăng kí',
                status :"opened"
            })

        }else if(req.body.permission == 'close'){
            switch (req.user.id){
                case 'fit':{
                    openPortDK.fit = false;
                    break;
                }
                case 'fet':{
                    openPortDK.fet = false
                    break;
                }
                case 'fema':{
                    openPortDK.fema = false;
                    break;
                }
                case 'fepn':{
                    openPortDK.fepn = false;
                    break;
                }
            }
            res.json({
                msg: 'đã đóng cổng đăng kí',
                status : "closed"
            })
        }
    }else {
        switch (req.user.id){
            case 'fit':{
                openPortDK.fit = false;
                break;
            }
            case 'fet':{
                openPortDK.fet = false
                break;
            }
            case 'fema':{
                openPortDK.fema = false;
                break;
            }
            case 'fepn':{
                openPortDK.fepn = false;
                break;
            }
        }
        res.json({
            msg: 'Có lỗi xảy ra'
        })
    }
})

/**
 * Xuất file word
 */
router.post("/exportDeNghi", utility.reqIsAuthen, utility.reqIsKhoa, function (req, res) {
    models.DeTai.getDeTaiAndSinhVienAndGiangVienForExport(req.user.id, models, function (data) {
        var arrayTile = ["Tên học viên", "Tên đề tài", "Giảng viên hướng dẫn"];
        var rowData = [];
        for (var i = 0; i < data.length; i++) {
            rowData.push([data[i].dataValues.SinhVien.tenSinhVien,
                data[i].dataValues.tenDeTai, data[i].dataValues.GiangVien.tenGiangVien]);
        }
        var title = "DANH SÁCH SINH VIÊN ĐƯỢC ĐỀ NGHỊ ĐĂNG KÍ KHÓA LUẬN TỐT NGHIỆP";
        exportFile.createFile(title,arrayTile,rowData,"denghi",function () {
            var path = utility.getMainHost(__dirname)+ "denghi.doc"
            console.log(path)
            res.sendFile(path)
        });



    }, function () {
        res.json({
            msg: "Xuất file thất bại"
        })
    })
});

/**
 * Kiếm tra đóng cổng rồi chót đề tài
 * xóa tất cả các đề tài chưa được chấp nhận
 * module 3 chốt đề tài được chấp nhập
 * Khoa khóa danh sách
 */
router.get('/chotdetaiduocnhapnhan',utility.reqIsAuthen,utility.reqIsKhoa,function (req,res) {
    models.DeTai.chotDeTaiDuocChapNhan(req.user.id,models,function (detai) {
        res.json({
            msg : "Chốt đề tài thành công",
            data : detai,
            status : 200
        })
    },function (err) {
        res.json({
            msg : "Chốt đề tài thất bại",
            error : err,
            status : 500
        })
    })
})
function updateSinhVienDuocDangki(data,req,res,next) {
    var svs = new Array();
    // validate data
    //
    //start
    for(var i=0;i<data.length;i++){
        if(validateUpdateSinhVien(data[i])){
            var sv = {
                id : data[i].id,
                tenSinhVien : data[i].tenSinhVien.trim(),
                duocDangKiKhoaLuanKhong: 1
            }
            svs.push(sv)
        }
        else {
            res.json({
                msg : "import data false! please check again !",
                situation : i
            })
        }
    }
    //update
    models.SinhVien.updateSinhVienDuocDangKi(svs,function () {
        console.log("Update thanh cong")
        return next();
    },function (position) {

        res.json({
            msg : "import data false! please check again",
            position : position
        })
    })
}
//return ojbj from xlxs
function getArrayFromXlsx(req, res, next) {

    var file = req.files.file;

    // Tên file
    var originalFilename = file.name;
    console.log("Ten file vua up: " + originalFilename)
    // File type
    var fileType = file.type.split('/')[1];

    // File size
    var fileSize = file.size;
    // Đường dẫn lưu ảnh
    var pathUpload = __dirname + '/xlsx/' + originalFilename;

    // START READ XLSX DATA
    //doc du lieu tu xlsx dua ve object
    var workbook = XLSX.readFile(file.path);
    var sheet_name_list = workbook.SheetNames;
    var data = [];
    sheet_name_list.forEach(function (y) {
        var worksheet = workbook.Sheets[y];
        var headers = {};

        for (z in worksheet) {
            if (z[0] === '!') continue;
            //parse out the column, row, and value
            var tt = 0;
            for (var i = 0; i < z.length; i++) {
                if (!isNaN(z[i])) {
                    tt = i;
                    break;
                }
            }
            ;
            var col = z.substring(0, tt);
            var row = parseInt(z.substring(tt));
            var value = worksheet[z].v;

            //store header names
            if (row == 1 && value) {
                headers[col] = value;
                continue;
            }

            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
        }

        //drop those first two rows which are empty
        data.shift();
        data.shift();
    });

    return next(data);
}
function validateUpdateSinhVien(data) {
    return (
        !validator.isEmpty(data.id.toString())
        && !validator.isEmpty(data.tenSinhVien)
        && validator.isInt(data.id.toString())
    )
}
module.exports = router;