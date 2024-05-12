const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = process.env.RCS;

class HandlerRcs {
  /**
   *
   * @param {String} reqCode - request code for generate Task
   * @param {String} taskType - Task Type Task Template mana yang digunakan
   * @param {Array} positionCodePath - Position code untuk task template
   * @param {String} podCode - Code untuk pod atau kereta atau rak yang digunakan
   * @param {Number} podDir - Direction untuk pod atau kereta atau rak
   * @param {Callback} Callback - Callback untuk response dari API yang kita hit
   */
  // async generateTask(
  //   robotCode,
  //   reqCode,
  //   taskType,
  //   positionCodePath,
  //   podCode,
  //   podDir,
  //   callback
  // ) {
  //   console.log('MASUK GA');

  //   const agvJobData = {
  //     reqCode: Date.now(),
  //     taskCode: Date.now(),
  //     //ctnrTyp: '1',
  //     reqTime: '',
  //     clientCode: '',
  //     tokenCode: '',
  //     taskTyp: "contoh1",
  //     wbCode: '',
  //     positionCodePath: [
  //       {
  //         "positionCode": "088000cc064000",
  //         "type": "00"
  //     },
  //     {
  //         "positionCode": "087000cc064000",
  //         "type": "00"
  //     },
  //     {
  //         "positionCode": "086000cc064000",
  //         "type": "00"
  //     },
  //     {
  //         "positionCode": "085000cc064000",
  //         "type": "00"
  //     },
  //     {
  //         "positionCode": "085000cc065000",
  //         "type": "00"
  //     },
  //     {
  //         "positionCode": "085000cc066000",
  //         "type": "00"
  //     }
  //     ],
  //     "podCode": "",
  //     "podDir": "",
  //     "podTyp": "",
  //     "priority": "",
  //     "agvCode": ""
  //   };
  //   // const genTask = await axios.post(
  //   //   BASE_URL + 'services/rest/hikRpcService/genAgvSchedulingTask',
  //   //   agvJobData
  //   // );
  //   const genTask = await axios.post("http://172.16.1.36:8182/rcms/services/rest/hikRpcService/genAgvSchedulingTask", agvJobData)
  //   console.log(genTask)
  //   callback(genTask.data.message, genTask.data);
  // }

  /**
   * To response callback from RCS task template
   * @param {Object} body - Body From request callback
   * @param {String} method - method used on task template
   * @param {Function} callback - function to return body
   * @returns
   */
  async callbackTask(body, method, callback) {
    if (body.method == method) {
      callback(body);
    } else {
      callback('beda');
    }
  }

  /**
   *
   * @param {Object} body -  Body From request callback
   * @param {Function} callback - function to message response from RCS
   */
//   async cancelTaskCallback(body, callback) {
//     const callbackTaskCode = body.taskCode;
//     const callbackMethod = body.method;

//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCodeCancel =
//       'CNCL_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const cancelTask = await axios.post(
//       BASE_URL + 'services/rest/hikRpcService/cancelTask',
//       {
//         reqCode: reqCodeCancel,
//         reqTime: '',
//         clientCode: '',
//         tokenCode: '',
//         forceCancel: '',
//         agvCode: '',
//         taskCode: callbackTaskCode,
//       }
//     );

//     callback(cancelTask.data.message, callbackMethod, callbackTaskCode);
//   }

  /**
   *
   * @param {String} body - body from callback
   * @param {Function} callback - function to message response from RCS
   */
//   async continueTaskCallback(body, destination, callback) {
//     // console.log("dari Continue Callback", body)
//     const callbackTaskCode = body.taskCode;
//     const callbackMethod = body.method;
//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCodeContinue =
//       'CNT_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const continueData = {
//       reqCode: reqCodeContinue,
//       reqTime: '',
//       clientCode: '',
//       tokenCode: '',
//       wbCode: '',
//       podCode: '',
//       agvCode: '',
//       taskCode: callbackTaskCode,
//       taskSeq: '',
//       // nextPositionCode: {
//       //     positionCode: destination, //Ngasal
//       //     type: "00"
//       // }
//     };

//     const continueTask = await axios.post(
//       BASE_URL + 'services/rest/hikRpcService/continueTask',
//       continueData
//     );

//     // console.log({ continueTask })

//     callback(continueTask.data.message, callbackMethod, callbackTaskCode);
//   }

  /**
   *
   * @param {String} body - body from callback
   * @param {Function} callback - function to message response from RCS
   */
//   async continueTask(body, destination, callback) {
//     // console.log("dari Continue Callback", body)
//     const callbackTaskCode = body.taskCode;
//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCodeContinue =
//       'CNT_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const continueData = {
//       reqCode: reqCodeContinue,
//       reqTime: '',
//       clientCode: '',
//       tokenCode: '',
//       wbCode: '',
//       podCode: '',
//       agvCode: '',
//       taskCode: callbackTaskCode,
//       taskSeq: '',
//       nextPositionCode: {
//         positionCode: destination, //Ngasal
//         type: '00',
//       },
//     };

//     const continueTask = await axios.post(
//       BASE_URL + 'services/rest/hikRpcService/continueTask',
//       continueData
//     );

//     callback(continueTask.data.message, callbackTaskCode);
//   }

//   async bindCtnr(stgBinCode, bind, ctnrTyp, callback) {
//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCode =
//       'Bind_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const data = {
//       reqCode: reqCode,
//       ctnrTyp: ctnrTyp,
//       stgBinCode: stgBinCode,
//       indBind: bind,
//     };

//     const cobaBind = await axios
//       .post(BASE_URL + 'services/rest/hikRpcService/bindCtnrAndBin', data)
//       .then(async (response) => {
//         // console.log("cek", response)
//         const isi = await response.data;
//         callback(isi);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//         callback(error);
//       });
//   }

  /**
   *
   * @param {*} podCode
   * @param {*} bind
   * @param {*} positionCode
   * @param {*} callback
   */
//   async bindPod(podCode, bind, positionCode, callback) {
//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCode =
//       'BindPod_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const data = {
//       reqCode: reqCode,
//       reqTime: '',
//       clientCode: '',
//       tokenCode: '',
//       podCode: podCode,
//       positionCode: ,
//       podDir: '1',
//       indBind: bind,
//     };

//     const cobaBind = await axios
//       .post(BASE_URL + 'services/rest/hikRpcService/bindPodAndBerth', data)
//       .then(async (response) => {
//         // console.log("cek", response)
//         const isi = await response.data;
//         callback(isi);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//         callback(error);
//       });
//   }

//   async cancelTask(taskCode, callback) {
//     const dateNow = new Date().toISOString().split('.')[0];
//     const reqCode = 'Cancel_' + dateNow + '_' + Math.floor(Math.random() * 1000).toString();
//     const data = {
//       reqCode: reqCode,
//       reqTime: '',
//       clientCode: '',
//       tokenCode: '',
//       forceCancel: '',
//       agvCode: '',
//       taskCode: taskCode,
//     };

//     const cobaBind = await axios
//       .post(BASE_URL + 'services/rest/hikRpcService/cancelTask', data)
//       .then(async (response) => {
//         // console.log("cekCancel", response)
//         const isi = await response.data;
//         callback(isi);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//         callback(error);
//       });
//   }
}

module.exports = HandlerRcs;
