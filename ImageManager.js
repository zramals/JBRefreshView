/*
 * @author @by zramals
 */
import React, { Component } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';

//图片数组  
var pulling_imgs = new Array();
var loading_imgs = new Array();
//最大图片张数  
const imagePullLength = 21;
const imageLoadLength = 24;

export default {

	pullImageView: function (styleType) {
		//初始化加载所有图片
		for (i = 1; i <= imagePullLength; i++) {
			let pullingUri = ''
			if (Platform.OS == 'ios') {
				pullingUri = 'refresh_source/' + styleType + '/pulling/pulling_' + i + '.png';
			} else {
				if (i < 10) {
					pullingUri = 'prepare_loading000' + i;
				} else {
					pullingUri = 'prepare_loading00' + i;
				}
			}
			let img = <Image source={{ uri: pullingUri }} key={i} style={{ width: 100, height: 10 }} resizeMode='contain' />;
			pulling_imgs.push(img);
		}
		return pulling_imgs;
	},

	loadMoreView: function (styleType) {
		//初始化加载所有图片
		for (i = 1; i <= imageLoadLength; i++) {
			let loadingUri = '';
			if (Platform.OS == 'ios') {
				loadingUri = 'refresh_source/' + styleType + '/loading/loading_' + i + '.png';
			} else {
				if (i < 10) {
					loadingUri = 'loading000' + i;
				} else {
					loadingUri = 'loading00' + i;
				}
			}
			let img = <Image source={{ uri: loadingUri }} key={i} style={{ width: 100, height: 10 }} resizeMode='contain' />;
			loading_imgs.push(img);
		}
		return loading_imgs;
	},

}