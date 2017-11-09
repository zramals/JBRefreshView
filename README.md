# JBRefreshView
react-native ,pure JS code for refresh and load more.
ps: if you want to use the 'normal' mode, you must edit ImageManager.js ,so that it can load your images in a right way.

###一、组件组成部分
- JBRefreshConfig  (配置项)
- JBRefreshView （组件）
- ImageManager（内置的gif图图片管理器）
###二、使用方式
- 引入
```
import JBRefreshView from './JBRefreshView'
```
JBRefreshConfig可选，用来配置一些属性，默认来说，上下拉刷新组件都是统一制定好的，所以一般不用再去特殊配置。

- ScrollView
直接使用JBRefreshView替换scrollView
```
onRefresh=(PullRefresh)=> {
		//do something
		setTimeout(() => {
			this.refs['KEY_REFRESH'].refreshed();
		}, 3000);
	}

<View style={[styles.container]}>
<JBRefreshView
ref={'KEY_REFRESH'}
onRefresh={this.onRefresh}
useLoadMore={false}
>
<View style={{ backgroundColor: '#eeeeee' }}>
<Text>9</Text>
<Text>13</Text>
<Text>14</Text>
</View>
</JBRefreshView>
</View>
```
- ListView
重写listview的内部scrollview用JBRefreshView替代,或者外面直接套用JBRefreshView都可以。
```
onRefresh(PullRefresh) {
		console.log('refresh');

		var self = this;
		setTimeout(function () {
			self.setState({
				dataSource: self.state.dataSource.cloneWithRows(['我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell'])
			});
			PullRefresh.loaded();
		}, 5000);

}

onLoadmore(PullRefresh) {
		var self = this;
		setTimeout(function () {

			self.data = self.data.concat(['我是一个cell(新)']);
			self.setState({
				dataSource: self.state.dataSource.cloneWithRows(self.data)
			});
			PullRefresh.loaded();
			//没有数据了，没有加载更多，则useLoadMore赋值为false
		}, 5000);

		console.log('onLoadMore');
}
render() {
		return (
			<View style={styles.container}>
				<ListView
				renderScrollComponent={(props) =>
					<JBRefreshView
						onRefresh={(PullRefresh) => this.onRefresh(PullRefresh)}
						onLoadmore={(PullRefresh) => this.onLoadmore(PullRefresh)}
						useLoadMore={true}
					/>}
				dataSource={this.state.dataSource}
				renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
				renderRow={(rowData) => <View style={styles.rowItem}><Text style={{ fontSize: 16 }}>{rowData}</Text></View>}
				/>
			</View>
)}
```
```
onRefresh(PullRefresh) {
		console.log('refresh');

		var self = this;
		setTimeout(function () {
			self.setState({
				dataSource: self.state.dataSource.cloneWithRows(['我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell'])
			});
			PullRefresh.loaded();
		}, 5000);

}

onLoadmore(PullRefresh) {
		var self = this;
		setTimeout(function () {

			self.data = self.data.concat(['我是一个cell(新)']);
			self.setState({
				dataSource: self.state.dataSource.cloneWithRows(self.data)
			});
			PullRefresh.loaded();
			//没有数据了，没有加载更多，则useLoadMore赋值为false
		}, 5000);

		console.log('onLoadMore');
}

render() {
		return (
			<RefreshView
					ref={KEY_REFRESH}
					onRefresh={(PullRefresh) => this.onRefresh(PullRefresh)}
					onLoadmore={(PullRefresh) => this.onLoadmore(PullRefresh)}
					useLoadMore={this.state.loadmore}
				>
					<ListView
						style={{ flex: 1 }}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow}
					/>
					{this._generateEmptyView()}
			</RefreshView>
)}
```
###三、可用属性和方法
- 属性
```
//告知外部，当前刷新状态的方法
onStatusChange: PropTypes.func,
//下拉刷新函数
onRefresh: PropTypes.func,
//上拉加载更多函数
onLoadmore: PropTypes.func,
//是否有loadmore
useLoadMore:PropTypes.bool,

topIndicatorHeight: config.topHeight,
bottomIndicatorHeight: config.bottomHeight,
duration: 300,
refreshType: 'normal',
useLoadMore: false,
customView: null,
customBottomView: null,
```
- 方法

```
refreshed  ()    //刷新完成后调用
loaded  ()      //加载更多完成后调用
弃用：noMoreData  ()  //没有更多的时候调用  (弃用，使用useLoadMore来做处理)
```

###四、遇到的问题
- 平台差异性之scrollView
- iOS：
iOS的scrollView到到达顶部或者头部时，scrollView还可以继续拉动，偏移量offset可以小于0或者大于contentSize，从而iOS原生层面可以通过这种特性，完成上下拉刷新头部底部的显示隐藏，使用offset来判断当前的状态。
- android
安卓scrollView到边界后，无法继续拉动。所以在scrollView上做文章不可行。

所以，我第一版上下拉刷新按照iOS原生方式去实现，测试时发现在安卓上不能跑，导致浪费了时间和精力。
- 平台差异之手势控制
- RN的底层手势处理使用PanResponder，想要控制手势事件肯定绕不过他，但是官方文档对这部分的介绍十分匮乏。尤其是一些控制函数根本没有说明。

总结如下：
详见：
```
http://blog.csdn.net/zramals/article/details/78403508
```

有任何问题请留言，
目前已知显示问题：
1.外层有scrollView时，由于scrollView事件响应很霸道，不能被拒绝，所以在上下拉动刷新时，依然会触发外层scrollView的滑动，所以不建议外层有可以上下滑动的scrollView，左右滑动产生的效果个人感觉可以接受。
2.由于scrollView的事件响应很霸道（跟上面怎么一样？），所以在scrollView滑动到顶部或底部的瞬间切换pan手势处理时，是会被scrollView拒绝掉的，所以显示效果上没有原生一滑到底的顺畅，需要再次拉动。
