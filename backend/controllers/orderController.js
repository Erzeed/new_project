const Order = require('../models/ordersModel');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const API_RCS = process.env.RCS_ADDR;

exports.order = catchAsync(async (req, res) => {
        // const { name } = req.user
        let date = new Date();
        let dateSekarang = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours() + ":" + date.getMinutes();
        try {
            let reqCodeData = "TASK_" + dateSekarang + "_" + 'cikini' +"-TO-"+ 'gondangdia'
            let agvJobData = {
                reqCode: reqCodeData,
                taskCode: dateSekarang,
                reqTime: "",
                clientCode: "",
                tokenCode: "",
                taskTyp: "contoh1",
                wbCode: "",
                positionCodePath: [
                        {
                            "positionCode": "088000cc064000",
                            "type": "00"
                        },
                        {
                            "positionCode": "087000cc064000",
                            "type": "00"
                        },
                        {
                            "positionCode": "086000cc064000",
                            "type": "00"
                        },
                        {
                            "positionCode": "085000cc064000",
                            "type": "00"
                        },
                        {
                            "positionCode": "085000cc065000",
                            "type": "00"
                        },
                        {
                            "positionCode": "085000cc066000",
                            "type": "00"
                        }
                    ],
                    podCode: "",
                    podDir: "",
                    podTyp: "",
                    priority: "",
                    agvCode: ""
                };
            let genTask = await axios.post(`${API_RCS}/rcms/services/rest/hikRpcService/genAgvSchedulingTask`,agvJobData)
            console.log(genTask.data);
            res.status(200)
        } catch (error) {
            console.log(error)
        }
})