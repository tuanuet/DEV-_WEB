/**
 * Created by Admin on 17/11/2016.
 */

"use strict";
var bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
    var SinhVien = sequelize.define("SinhVien", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        tenSinhVien: {
          type: DataTypes.STRING(45),
          allowNull : false
        },
        vnuMail: {
          type: DataTypes.STRING(45),
          allowNull : false
        },
        matKhau: {
          type: DataTypes.STRING(45),
          allowNull : false
        },
        avatar : DataTypes.STRING,
        duocDangKiKhoaLuanKhong: DataTypes.INTEGER(1)
    }, {
        timestamps: false,
        classMethods: {
            associate: function (models) {
                this.belongsTo(models.NganhHoc, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                this.belongsTo(models.KhoaHoc, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                this.hasOne(models.DeTai)
            },
            insertBulkSV : function (svs,callback,callback2) {
                this.bulkCreate(svs,{validate : true})
                    .then(callback)
                    .catch(callback2)
            },
            insertOneSV : function (sv,success,failure) {
                this.create(sv).then(success).catch(failure)
            },
            getSinhVienByTaiKhoan: function (taiKhoan, callback) {
                this.findOne({
                    where: {
                        vnuMail: taiKhoan
                    }
                }).then(callback)
            },
            comparePassword: function (candidatePassword, hash, callback) {
                if (candidatePassword == hash)
                    callback(null, true)
                else callback(null, false)
                // bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
                //     if (err) throw err;
                //     callback(null, isMatch);
                // });
            },
            getSVByID: function (id, callback) {
                this.findOne({
                    where: {
                        id: id
                    }
                }).then(callback)
            },
            getSinhVienAndKhoaAndKhoaHocAndNganhHoc : function (idSinhVien,models,success,failure) {
                this.findOne({
                    where: {id : idSinhVien},
                    include : [
                        {model : models.KhoaHoc},
                        {
                            model : models.NganhHoc,
                            include : [
                                {model : models.Khoa}
                            ]
                        }
                    ]
                }).then(success).catch(failure)
            },
            updateSinhVienDuocDangKiByID : function (id,success,failure) {
                this.findOne({
                    where : {id : id}
                }).then(function (sv) {
                    if(sv){
                        this.update({
                            duocDangKiKhoaLuanKhong : 1
                        },{
                            where : {id : id}
                        }).then(success).catch(failure)
                    }else {
                        failure();
                    }

                }).catch(failure)

            },
            getAllSinhVien : function (success,failure) {
                this.findAll({}).then(success).catch(failure)
            },
            updateSinhVienDuocDangKi : function (svs,success,failure) {
                var dem=0;
                for(var i = 0;i<svs.length;i++){
                    this.update({
                        duocDangKiKhoaLuanKhong : 1
                    },{where :{id : svs[i].id}}).then(function (sv) {
                        dem+=sv[0]
                        if(dem == svs.length){
                            success();
                        }
                    }).catch(function () {
                        return failure(i)
                    })
                }
            },
            getSinhVienDuocDangKiKhoaLuan : function (success,failure) {
                this.findAll({
                    where : {
                        duocDangKiKhoaLuanKhong : 1
                    }
                }).then(success).catch(failure)
            },
            updateAvatar : function (id,url,success,failure) {
                this.update(
                    {avatar : url},{
                    where : {id : id}
                }).then(success).catch(failure)
            },
            getAllSV : function (callback) {
                this.findAll({}).then(callback)
            }
        }
    });

    return SinhVien;
};
