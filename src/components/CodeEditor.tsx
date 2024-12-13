import request from '@wencloud/lib-utils/src/request'

// 尽调报告 - 分页查询
export function getInvestigatePageList(data) {
	return request({
		url: `/admin/business/investigate/page`,
		method: 'post',
    data
	})
}

// 尽调报告 - 导出
export function postInvestigateExport(data) {
	return request({
		url: `/admin/business/investigate/export`,
		method: 'post',
		responseType: 'blob',
    data
	})
}

// 尽调报告 - 统计
export function getInvestigateStatistics(data) {
	return request({
		url: `/admin/business/investigate/statistics`,
		method: 'post',
    data
	})
}

// 尽调报告 - 获取详情
export function getInvestigate(id) {
	return request({
		url: `/admin/business/investigate/${id}`,
		method: 'get'
	})
}

// 尽调报告 - 删除
export function deleteInvestigate(id) {
	return request({
		url: `/admin/business/investigate/${id}`,
		method: 'delete'
	})
}

// 尽调报告 - 指派人员
export function putInvestigateAssign(data) {
	return request({
		url: `/admin/business/investigate/assign`,
		method: 'put',
    data
	})
}

// 尽调报告 - 转派
export function putInvestigateTransfer(data) {
	return request({
		url: `/admin/business/investigate/reAssign`,
		method: 'put',
    data
	})
}

// 尽调报告 - 接受任务
export function putInvestigateReceive(data) {
	return request({
		url: `/admin/business/investigate/receive`,
		method: 'put',
    data
	})
}

// 尽调报告 - 上传报告
export function putInvestigateReport(data) {
	return request({
		url: `/admin/business/investigate/report`,
		method: 'put',
    data
	})
}

// 尽调报告 - 统计
export function postInvestigateList(data) {
	return request({
		url: `/admin/business/investigate/listWithAssigner`,
		method: 'post',
    data
	})
}

// 尽调报告 - 获取尽调人
export function getInvestigateUser() {
	return request({
		url: `/admin/business/investigate/findUserByConditionWithoutPage`,
		method: 'post'
	})
}

// 尽调报告 - 保存尽调人
export function postSaveInvestigateUser(data) {
	return request({
		url: `/admin/business/investigate/saveInvestigateUser`,
		method: 'post',
    data
	})
}

// 尽调报告 - 人员安排设置 尽调人列表
export function getFindByConditionWithAuthority(params) {
	return request({
		url: `/admin/business/investigate/findByConditionWithAuthority`,
		method: 'get',
    params
	})
}