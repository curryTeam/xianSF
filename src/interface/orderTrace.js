/**
 * @description search order route
 * @params tracking_type(订单类型 1: 顺丰运单号 2: 客户订单号 默认为1)
 *         tracking_number(订单号)
 *         method_type(路由查询类别 1: 标准路由查询 2: 定制路由查询)
 * @example
 *  { tracking_type: 1, tracking_number: '444003077898' }
 */
import xml2js from 'xml2js';
import request from 'request';
import Common from './common';
import Config from '../config';

const queryString = require('query-string');

export default class OrderTrace extends Common {
    // super props
    constructor(props) {
        super(props);
    }
    // getStr
    /** request infomation
     * <Request service='RouteService' lang='zh-CN'>
        <Head>BSPdevelop</Head>
        <Body>
            <RouteRequest
            tracking_type='1'
            method_type='1'
            tracking_number='444003077898'/>
        </Body>
        </Request>
     */
    buildNowXml(data) {
        const xml = `<Request service='RouteService' lang='zh-CN'>
                        <Head>${this.options.devCode},${this.options.checkword}</Head>
                        <Body>${data}</Body>
                     </Request>`;
        return xml;
    }
    getStr(data) {
        let order = '<RouteRequest ';
        for (const item in data) {
            order = `${order}${item}="${params[item]}" `;
        }
        order = order + '/>';
        const xml = this.buildNowXml(order);
        const sign = this._getSign(xml, this.options.checkword);
        return queryString.stringify({ xml, verifyCode: sign });
    }
    //sendOrderTraceRequest
    sendOrderTraceRequest(data) {
        const url = this.options.url;
        const  formData = this.getStr(data);
        return new Promise((resolve, reject) => {
            request({
                headers: {
                    'charset': 'UTF-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: url,
                body: formData,
                method: 'POST'
            }, function (err, res, body) {
                if(err) {
                    reject(err);
                } else {
                    const parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
                    parser.parseString(body, (error, result) => {
                        if (!err) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                }
            });
        });
    }
    // make order trace
    makeOrderTrace(requestData, options = {}) {
        this.mixOptions(Config.sfOrderTrace, options);
        return this.sendOrderTraceRequest(requestData);
    }
}