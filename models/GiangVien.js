/**
 * Created by Admin on 17/11/2016.
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    var GiangVien = sequelize.define("GiangVien", {
        id: {
            type: DataTypes.STRING(11),
            primaryKey: true
        },
        tenGiangVien: DataTypes.STRING(100),
        vnuMail: DataTypes.STRING(45),
        matKhau: DataTypes.STRING(45),
        DonViId : DataTypes.INTEGER(11)
    }, {
        timestamps: false,
        classMethods: {
            associate: function (models) {
                this.belongsTo(models.DonVi, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                this.hasMany(models.LinhVucLienQuan);
                this.hasMany(models.ChuDeLienQuan);

            },
            insertBulkGV : function (gvs,callback) {
                console.log(gvs)
                this.bulkCreate(gvs).then(callback)
            },
            getGiangVienByTaiKhoan: function (taiKhoan, callback) {
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
            getGVByID: function (idKhoa, callback) {
                this.findOne({
                    where: {
                        id: idKhoa
                    }
                }).then(callback)
            }
        }
    });

    return GiangVien;
};