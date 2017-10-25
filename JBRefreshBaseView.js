import React, { Component } from 'react';
import { View, Text, PanResponder, Animated, Easing, Dimensions, StyleSheet, ScrollView, Platform } from 'react-native';
import PropTypes from 'prop-types'
import imageViews from './ImageManager'
import config from './JBRefreshConfig'

const defaultFlag = { pulling: false, pullok: false, pullrelease: false, loading: false, loadok: false, loadrelease: false, status: 'normal' };
const flagPulling = { pulling: true, pullok: false, pullrelease: false, status: 'pulling' };
const flagPullok = { pulling: false, pullok: true, pullrelease: false, status: 'pullok' };
const flagPullrelease = { pulling: false, pullok: false, pullrelease: true, status: 'pullrelease' };

const flagLoading = { loading: true, loadok: false, loadrelease: false, status: 'loading' };
const flagLoadok = { loading: false, loadok: true, loadrelease: false, status: 'loadok' };
const flagLoadrelease = { loading: false, loadok: false, loadrelease: true, status: 'loadrelease' };

//判断方法
const isDownGesture = (x, y) => {
	return y > 0 && (y > Math.abs(x));
};
const isUpGesture = (x, y) => {
	return y < 0 && (Math.abs(x) < Math.abs(y));
};
const isVerticalGesture = (x, y) => {
	return (Math.abs(x) < Math.abs(y));
};

export default class JBRefreshBaseView extends Component {
	static defaultProps = {
		onStatusChange: null,
		topIndicatorHeight: config.topHeight,
		bottomIndicatorHeight: config.bottomHeight,
		duration: 300,
		refreshType: 'text',//'normal'没有需要到imagemanager设置图片
		useLoadMore: false,
		customView: null,
		customBottomView: null,
	}
	static propTypes = {
		//告知外部，当前刷新状态的方法
		onStatusChange: PropTypes.func,
		//下拉刷新函数
		onRefresh: PropTypes.func,
		//上拉加载更多函数
		onLoadmore: PropTypes.func,
		//是否有loadmore
		useLoadMore:PropTypes.bool,
	}

	constructor(props) {
		super(props);

		//header高度
		this.topIndicatorHeight = this.props.topIndicatorHeight;
		this.bottomIndicatorHeight = this.props.bottomIndicatorHeight;
		this.defaultXY = { x: 0, y: this.topIndicatorHeight * -1 };  //animatedView默认位置

		this.duration = this.props.duration;
		this.isScrollable = true;  //为安卓添加滚动判断属性，防止setstate响应不及时。

		this.imageViewArray = imageViews.pullImageView('light');
		this.imageBottomViewArray = imageViews.loadMoreView('light');
		this.flag = defaultFlag;
		this.useLoadMore = this.props.useLoadMore;

		this.state = {
			pullPan: new Animated.ValueXY(this.defaultXY),  //animatedView操作属性
			scrollEnabled: this.isScrollable,   //使用this.isScrollable赋值，通过scrollenable来关闭响应
			flag: defaultFlag,   //当前的上下拉刷新状态
			height: 0,  //layout时使用，给view宽高赋值

			imageIndex: 0,  //当前显示图片的index
			imageBottomIndex: 0, //bottom图面的index,图片可能不一样，需要分开处理
		};
		//手势滚动和松开后，记录当前是否在边界状态，若在top，则下拉时不会调用scrollTo方法，而直接使用pan
		//若在bottom，则上拉使用pan而不是scrollto
		this.topOrBottomStatus = 'top';
		//手势创建
		this.panResponder = PanResponder.create({
			//这个视图是否在触摸开始时想成为响应器？ 
			onStartShouldSetPanResponder: this._onStartShouldSetPanResponder,
			//所以如果一个父视图要防止子视图在触摸开始时成为响应器，它应该有一个 onStartShouldSetResponderCapture 处理程序，返回 true。
			onStartShouldSetPanResponderCapture: this._onStartShouldSetPanResponderCapture,
			//当视图不是响应器时，该指令被在视图上移动的触摸调用：这个视图想“声明”触摸响应吗? 
			onMoveShouldSetPanResponder: this._onMoveShouldSetPanResponder,
			//所以如果一个父视图要防止子视图在移动开始时成为响应器，它应该有一个 onMoveShouldSetPanResponderCapture 处理程序，返回 true。
			onMoveShouldSetPanResponderCapture: this._onMoveShouldSetPanResponderCapture,
			//当前有其他的东西成为响应器并且没有释放它。 
			onResponderReject: this._onResponderReject,
			//视图现在正在响应触摸事件。这个时候要高亮标明并显示给用户正在发生的事情。
			onPanResponderGrant: this._onPanResponderGrant,
			//用户正移动他们的手指 
			onPanResponderMove: this._onPanResponderMove,
			//在触摸最后被引发，即“touchUp” 
			onPanResponderRelease: this._onPanResponderRelease,
			//onResponderTerminationRequest:其他的东西想成为响应器。这种视图应该释放应答吗？返回 true 就是允许释放 
			//响应器已经从该视图抽离了。可能在调用onResponderTerminationRequest 之后被其他视图获取，也可能是被操作系统在没有请求的情况下获取了(发生在 iOS 的 control center/notification center)。 
			onPanResponderTerminate: this._onPanResponderRelease,
		});
		// this.setFlag(defaultFlag); //默认flag
	}
	/**
	 * EventCaptureHandle
	 */
	_onStartShouldSetPanResponder = (e, gestureState) => {
		return false;
	}
	_onStartShouldSetPanResponderCapture = (e, gestureState) => {
		return false;
	}
	_onMoveShouldSetPanResponder = (e, gestureState) => {
		return this._shouldBecomeCapture(e, gestureState);
	}
	_onMoveShouldSetPanResponderCapture = (e, gestureState) => {
		return this._shouldBecomeCapture(e, gestureState);
	}
	_onPanResponderGrant = (e, gesture) => {
	}
	_onResponderReject = (e, gestureState) => {
	}
	_onPanResponderTerminationRequest = (evt, gestureState) => {
		return true;
	}
	_onPanResponderTerminate = (evt, gestureState) => {
		// 另一个组件已经成为了新的响应者，所以当前手势将被取消。
	}
	_onShouldBlockNativeResponder = (evt, gestureState) => {
		// 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
		// 默认返回true。目前暂时只支持android。
		return true;
	}
	_shouldBecomeCapture = (e, gesture) => {
		//如果上拉，但此时scrollView以到底，则手势不交给子view
		//如果下拉，但此时scrollView已经到顶，则手势不交给子view处理
		//安卓无效，不能控制子view释放响应，使用isScrollable关闭scrollview响应
		//iOS当子组件scroll到达底部或者顶部时，继续上拉或者下拉则截取手势控制
		if (/*this.isScrollable || */!isVerticalGesture(gesture.dx, gesture.dy)) { //子view可滑动,或非向上 或向下手势不响应
			return false;
		}
		this.lastY = this.state.pullPan.y._value;  //记录上次滑动位置

		if (isUpGesture(gesture.dx, gesture.dy)) {   //上拉
			if (this.useLoadMore && this.topOrBottomStatus == 'bottom') {  //当前已经在底部
				this.isScrollable = false;
				this.scroll.setNativeProps({
					scrollEnabled: this.isScrollable,
				});
				return true;
			} else {   //不在底部
				this.isScrollable = true;
				this.scroll.setNativeProps({
					scrollEnabled: this.isScrollable,
				});
				return false
			}
		}
		if (isDownGesture(gesture.dx, gesture.dy)) {  //下拉
			if (this.topOrBottomStatus == 'top') {   //在顶部则响应，scrollview关闭滚动
				this.isScrollable = false;
				this.scroll.setNativeProps({
					scrollEnabled: this.isScrollable,
				});
				return true;
			} else {
				this.isScrollable = true;
				this.scroll.setNativeProps({
					scrollEnabled: this.isScrollable,
				});
				return false
			}
		}
		return false;
	}

	_onPanResponderMove = (e, gesture) => {
		//使用一个变量记录pan的实时位置，当pan有值时，对pan进行操作，当pan确认已经恢复默认位置时，则进行scroll处理
		//向上滑动，不是上拉状态时，进行pan操作，否则scrollto操作，scrollto中到达底部时，禁止滑动，改变为上拉状态，此时触发pan操作
		//向下滑动，不是拉动状态时，进行pan的操作，否则scrollto操作，scroll到达顶部时，禁止滑动，触发pan操作，
		//安卓不关闭scrollView事件无法进入。
		if (isUpGesture(gesture.dx, gesture.dy)) { //向上滑动时
			//如果不可滑动，或者在底部，或者在loadrelease中，则调用pan方法移动animatedView
			if (this.isPullState()) {
				//是任何下拉相关状态时，不响应
				return;
			}
			if (this.flag.loadrelease /*|| !this.isScrollable */ || this.topOrBottomStatus == 'bottom') {
				//不可滑动，并且到达底部，直接移动view，并且处理相应状态
				this.state.pullPan.setValue({ x: this.defaultXY.x, y: this.lastY + gesture.dy / 2 });
				//不在loadrelease中
				if (!this.flag.loadrelease) {
					//根据高度展示gif图
					let absY = Math.abs(gesture.dy / 2);
					let imageBottomIndex = Math.floor(absY / this.bottomIndicatorHeight * this.imageBottomViewArray.length);
					imageBottomIndex = (imageBottomIndex > this.imageBottomViewArray.length) ? this.imageBottomViewArray.length - 1 : imageBottomIndex;
					this.setState({
						imageBottomIndex: imageBottomIndex,
					})
					if ((gesture.dy / 2) > -this.bottomIndicatorHeight) { //正在上拉，没到位置
						if (!this.flag.loading) {
							//调用回调方法
							this.setFlag(flagLoading);
						}
					} else { //上拉到位
						if (!this.flag.loadok) {
							//调用回调方法
							this.setFlag(flagLoadok);	
						}
					}
				}
			} else {
				//既没在底部，又可以滑动，且不在Loadrelease状态中（可以滑动状态，安卓无法调用到此）
				this.scroll.scrollTo({ x: 0, y: gesture.dy * -1 });
			}
		} else if (isDownGesture(gesture.dx, gesture.dy)) { //下拉
			if (this.isLoadState()) {
				//是任何上拉相关状态时，不响应
				return;
			}
			if (this.flag.pullrelease /*|| !this.isScrollable */ || this.topOrBottomStatus == 'top') {
				//到顶部之后还继续下拉，使用pan进行view的拉动
				this.state.pullPan.setValue({ x: this.defaultXY.x, y: this.lastY + gesture.dy / 2 });  //gesture.dy/2 减速处理
				//根据高度展示gif图
				if (!this.flag.pullrelease) {
					let absY = Math.abs(this.lastY + gesture.dy)
					let imageIndex = Math.floor(absY / this.topIndicatorHeight * this.imageViewArray.length);
					imageIndex = (imageIndex > this.imageViewArray.length) ? this.imageViewArray.length - 1 : imageIndex;
					this.setState({
						imageIndex: imageIndex,
					})
					if ((gesture.dy / 2) < this.topIndicatorHeight) { //正在下拉
						if (!this.flag.pulling) {
							this.setFlag(flagPulling);
						}
					} else { //下拉到位
						if (!this.flag.pullok) {
							this.setFlag(flagPullok);
						}
					}
				}
			} else {
				//没有到顶,scrollview仍可以滑动，
				this.scroll.scrollTo({ x: 0, y: gesture.dy * -1 });
			}
		}
	}

	_onPanResponderRelease = (e, gesture) => {
		//根据flag状态进行相应的行为，上下拉未到位松开，则恢复默认位置，上下拉到位则调用回调方法，记录当前边界状态。
		if (this.flag.pulling) { //没有下拉到位
			this.resetPosition();//重置状态
		}
		if (this.flag.pullok || this.flag.pullrelease) {
			if (!this.flag.pullrelease) {  //第一次下拉到位，不在释放状态
				if (!this.timerPic) {
					this.timerPic = setInterval(this._loop.bind(this), config.pullingImageFrequence);
				}
				if (this.props.onRefresh) {
					this.props.onRefresh(this);
				}
			}
			this.setFlag(flagPullrelease); //完成下拉，已松开

			//动画回到正在刷新位置
			this.refreshingStatus();
		}
		if (this.flag.loading) {//没有上拉到位
			this.resetPosition(); //重置状态
		}
		if (this.flag.loadok || this.flag.loadrelease) {//上拉到位

			if (!this.flag.loadrelease) {
				if (!this.timerBottomPic) {
					this.timerBottomPic = setInterval(this._loopBottom.bind(this), config.loadingImageFrequence);
				}
				if (this.props.onLoadmore) {
					this.props.onLoadmore(this);
				} else {
					setTimeout(() => { this.resetPosition() }, 3000);
				}
			}
			this.setFlag(flagLoadrelease); //完成下拉，已松开
			this.loadingStatus();

		}
		//释放手势之后，让scroll变得可以滑动
		this.isScrollable = true;
		this.scroll.setNativeProps({
			scrollEnabled: this.isScrollable,
		});

	}
	//scrollview滑动函数，enable状态和scrollto是会调用此方法
	onScroll = (e) => {
		let target = e.nativeEvent;
		let offsetY = target.contentOffset.y;
		let scrollContentHeight = target.contentSize.height;
		let scrollHeight = target.layoutMeasurement.height;
		let mixOffset = scrollContentHeight - scrollHeight;

		//当到达底部和顶部时，禁止scrollview继续滑动
		if (offsetY <= 0) {
			this.topOrBottomStatus = 'top';
			this.isScrollable = false;
		} else if (this.useLoadMore && offsetY >= mixOffset) {
			this.topOrBottomStatus = 'bottom';
			this.isScrollable = false;
		}
		else {
			this.isScrollable = true;
			this.topOrBottomStatus = 'content';
		}
		this.scroll.setNativeProps({
			scrollEnabled: this.isScrollable,
		});
		//回调
		this.props.onScroll && this.props.onScroll(e);
	}
	// 手指离开
	onScrollEndDrag = (e) => {
		//获取target做后续处理，判断当前是上拉下拉
		let target = e.nativeEvent;
		let offsetY = target.contentOffset.y;
		let scrollContentHeight = target.contentSize.height;
		let scrollHeight = target.layoutMeasurement.height;
		let mixOffset = scrollContentHeight - scrollHeight;
		if (offsetY <= 0) {
			this.topOrBottomStatus = 'top';
			this.isScrollable = false;
			this.scroll.scrollTo({ x: 0, y: 0, animated: false });
		} else if (this.useLoadMore && offsetY >= mixOffset) {
			this.topOrBottomStatus = 'bottom';
			this.isScrollable = false;
			this.scroll.scrollToEnd({ animated: false });
		} else {
			this.topOrBottomStatus = 'content';
			this.isScrollable = true;
		}
		this.scroll.setNativeProps({
			scrollEnabled: this.isScrollable,
		});
		this.props.onScrollEndDrag && this.props.onScrollEndDrag(e);
	}

	//状态判断函数
	isPullState = () => {
		return this.flag.pulling || this.flag.pullok || this.flag.pullrelease;
	}
	isLoadState = () => {
		return this.flag.loading || this.flag.loadok || this.flag.loadrelease;
	}
	setFlag = (flag) => {
		if (this.flag != flag) {
			this.flag = flag;
			this.setState({
				flag: this.flag,
			})
			//通知当前状态
			this.props.onStatusChange && this.props.onStatusChange(this.flag.status);
		}
	}

    /** 数据加载完成后调用此方法进行重置归位
	*/
	refreshed = () => {
		this.resolveHandler();
	}
	loaded = () => {
		this.topOrBottomStatus = 'content';
		this.resolveHandler();
	}
	noMoreData = ()=>{
		this.resolveHandler();
		this.useLoadMore = false;
	}

	resolveHandler = () => {
		// if (this.flag.pullrelease && this.flag.loadrelease) { //仅触摸松开时才触发
			this.resetPosition();
		// }
	}
	//恢复默认位置
	resetPosition = () => {
		this.flag = defaultFlag;
		Animated.timing(this.state.pullPan, {
			toValue: this.defaultXY,
			easing: Easing.linear,
			duration: 300
		}).start();
		this.clearTimers();
	}
	//刷新状态
	refreshingStatus = () => {
		Animated.timing(this.state.pullPan, {
			toValue: { x: 0, y: 0 },
			easing: Easing.linear,
			duration: 300
		}).start();

	}
	//load状态
	loadingStatus = () => {
		Animated.timing(this.state.pullPan, {
			toValue: { x: 0, y: -this.bottomIndicatorHeight - this.topIndicatorHeight },
			easing: Easing.linear,
			duration: 300
		}).start();
	}
	onLayout = (e) => {
		if (this.state.width != e.nativeEvent.layout.width || this.state.height != e.nativeEvent.layout.height) {
			this.scrollContainer.setNativeProps({ style: { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height } });
			this.width = e.nativeEvent.layout.width;
			this.height = e.nativeEvent.layout.height;
		}
	}
	//刷新gif图循环
	_loop() {
		this.loopCount++;
		if (this.loopCount < this.imageViewArray.length) {
			this.setState({
				imageIndex: this.loopCount,
			});
		} else {
			this.loopCount = -1;
		}
	}
	_loopBottom() {
		this.loopBottomCount++;
		if (this.loopBottomCount < this.imageBottomViewArray.length) {
			this.setState({
				imageBottomIndex: this.loopBottomCount,
			});
		} else {
			this.loopBottomCount = -1;
		}
	}
	//清除定时器
	clearTimers() {
		//清除图片定时器
		this.timerPic && clearInterval(this.timerPic);
		this.timerBottomPic && clearInterval(this.timerBottomPic);
		this.timerPic = null;
		this.timerBottomPic = null;
		this.loopCount = -1;
		this.loopBottomCount = -1;
	}

	renderNormalContent() {
		console.log(this.state.imageIndex)
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				{this.imageViewArray[this.state.imageIndex]}
			</View>
		);
	}
	rendeTextContent() {
		let contents = [];
		// let status = 'normal';
		if(this.isPullState()){
			contents.push(<Text key={11}>{config.textConfig[this.state.flag.status]}</Text>);
		}
		return (contents);
	}
	rendeCustomContent() {
		return this.props.customView;
	}
	renderBottomContent() {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				{this.imageBottomViewArray[this.state.imageBottomIndex]}
			</View>
		);
	}
	rendeTextBottomContent() {
		let contents = [];
		if(this.isLoadState()){
			contents.push(<Text key={11}>{config.textConfig[this.state.flag.status]}</Text>);
		}
		return (contents);
	}
	rendeCustomBottomContent() {
		return this.props.customBottomView;
	}

	renderTopIndicator() {
		let type = this.props.refreshType;
		let contents;

		if (type == 'normal') {
			contents = [this.renderNormalContent()];
		}
		if (type == 'text') {
			contents = [this.rendeTextContent()];
		}
		if (type == 'custom') {
			contents = [this.rendeCustomContent()];
		}
		return (
			<View style={{
				backgroundColor: config.pullRefreshBackgroundColor,
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				height: this.topIndicatorHeight
			}}>
				{contents.map((item, index) => {
					return <View key={index}>{item}</View>
				})}
			</View>
		);
	}

	renderBottomIndicator = () => {
		let type = this.props.refreshType;
		let contents;

		if (type == 'normal') {
			contents = [this.renderBottomContent()];
		}
		if (type == 'text') {
			contents = [this.rendeTextBottomContent()];
		}
		if (type == 'custom') {
			contents = [this.rendeCustomBottomContent()];
		}
		return (
			<View style={{
				backgroundColor: config.loadMoreBackgroundColor,
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				height: this.bottomIndicatorHeight
			}}>
				{contents.map((item, index) => {
					return <View key={index}>{item}</View>
				})}
			</View>
		);
	}

	render() {
		return (
			<View
				style={[{ flex: 1, flexGrow: 1, flexDirection: 'column', zIndex: -999, }, this.props.style]}
				onLayout={this.onLayout}>
				<Animated.View
					ref={(animatedView) => this.animatedView = animatedView}
					style={[this.state.pullPan.getLayout()]}>
					{this.renderTopIndicator()}
					<View
						ref={(scrollContainer) => { this.scrollContainer = scrollContainer; }}
						{...this.panResponder.panHandlers}
						style={{ width: this.state.width, height: this.state.height }}>
						{this.getScrollable(null)}
					</View>
					{this.renderBottomIndicator()}
				</Animated.View>
			</View>
		);
	}
}

//style
const styles = StyleSheet.create({

});