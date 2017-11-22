'use strict';

import React, { Component } from 'react';
import { ScrollView } from 'react-native';

import JBRefreshBaseView from './JBRefreshBaseView';


export default class extends JBRefreshBaseView {

	constructor(props) {
		super(props);
		this.scrollTo = this.scrollTo.bind(this);
		this.scrollToEnd = this.scrollToEnd.bind(this);
	}

	scrollTo(...args) {
		this.scroll.scrollTo(...args);
	}

	scrollToEnd(args) {
		this.scroll.scrollTo(args);
	}

	getScrollable(refreshControl) {
		return (
			<ScrollView ref={(c) => { this.scroll = c; }}
				refreshControl={refreshControl}
				scrollEnabled={this.state.scrollEnabled}
				onScroll={this.onScroll}
				scrollEventThrottle={16}
				canCancelContentTouches={this.props.canCancelContentTouches}
				onScrollEndDrag={this.onScrollEndDrag}>
				{this.props.children}
			</ScrollView>
		);
	}

}
