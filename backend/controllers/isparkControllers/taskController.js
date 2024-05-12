const axios = require('axios');
const catchAsync = require('../../utils/catchAsync');
const HandlerRcs = require('../handleRcs');

const handlerRcs = new HandlerRcs();

exports.callback = catchAsync(async (req, res, next) => {
    function responseToRCS() {
      return res.status(200).json({
        code: '0',
        message: 'Success',
        reqCode: req.body.reqCode,
      });
    }

    await handlerRcs.callbackTask(req.body, 'begin', async (body) => {
      if(body.method == "begin"){
        console.log('begin');
        const dateExec = new Date().toISOString().split('.')[0];
        console.log(body, dateExec)
        // CARI TASK
        // const findTask = await Task.findOneAndUpdate(
        //     {
        //       taskCode: body.taskCode,
        //     },
        //     { jobStatus: 'process', robotCode: body.robotCode, execTime: dateExec },
        //     { new: true }
        //   );
        }
      });
    
    await handlerRcs.callbackTask(req.body, 'wait', async (body) => {
      if (body.method == "wait"){
        console.log('wait');
      }
      });
    await handlerRcs.callbackTask(req.body, 'begin_2', async (body) => {
      if (body.method == "begin_2"){
        console.log('begin_2');
      }
      });

    await handlerRcs.callbackTask(req.body, 'completed', async (body) => {
      if (body.method == "completed"){
        console.log('completed');
      }
      });
  })