# JBRefreshView
react-native纯js编写的上下拉刷新组件。
注意：
npm安装请使用，npm i react-native-refresh-view-pure
react-native-jbrefreshview已不在维护。

如果想要使用自定义的gif图片，则需要自己编写ImageManager.js文件，绑定自己的图片。

react-native ,pure JS code for refresh and load more.
ps: if you want to use your own images, you must edit ImageManager.js ,make sure it can load your images in a right way.

### 一、组件组成部分
- JBRefreshConfig  (配置项)
- JBRefreshView （组件）
- ImageManager (图片工具类)

### 二、使用方式
- 引入
```
import {JBRefreshView,JBRefreshConfig} from './JBRefreshView'
```
JBRefreshConfig可选，用来配置一些全局属性，默认来说，上下拉刷新组件都是统一制定好的，所以在启动时设定为自己想要的全局配置即可，对于需要根据情况特殊配置的，则使用JBRefreshView提供的属性进行配置。

- 使用 
在需要使用的地方套上JBRefreshView即可，不管是view，listView都支持直接套在外面使用。

直接使用JBRefreshView替换scrollView，增加上下拉刷新能力。
```
//最简单的使用例子
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
重写listview的内部scrollview用JBRefreshView替代,或者外面直接套用JBRefreshView都可以。
以下提供两种方法实例，如无特殊情况，推荐使用外层套用JBRefreshView，并给JBRefreshView设定refs来使用其中的refreshed等方法。

```
//直接套路的例子
onRefresh = () => {
	var self = this;
	setTimeout(function () {
		self.setState({
			dataSource: self.state.dataSource.cloneWithRows(['我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell'])
		});
        this.refs[KEY_REFRESH].refreshed();
		//PullRefresh.refreshed();
	}, 5000);
}

onLoadmore = () => {
	var self = this;
	setTimeout(function () {
		self.data = self.data.concat(['我是一个cell(新)']);
		self.setState({
			dataSource: self.state.dataSource.cloneWithRows(self.data)
		});
        this.refs[KEY_REFRESH].loaded();
		//PullRefresh.loaded();
		//没有数据了，没有加载更多，则useLoadMore赋值为false
	}, 5000);
}

render() {
	return (
		<RefreshView
			ref={KEY_REFRESH}
			onRefresh={this.onRefresh}
			onLoadmore={this.onLoadmore}
			useLoadMore={this.state.loadmore}
		>
			<ListView
				style={{ flex: 1 }}
				dataSource={this.state.dataSource}
				renderRow={this._renderRow}
			/>
		</RefreshView>
)}
```
```
//重写renderScrollComponent的例子
onRefresh(PullRefresh) {
	var self = this;
	setTimeout(function () {
	self.setState({
		dataSource:self.state.dataSource.cloneWithRows(['我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell', '我是一个cell'])
			});
		PullRefresh.refreshed();
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

### 三、可用属性和方法
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
//上下拉自定义的高度，全局设定建议在JBRefreshConfig设定好
topIndicatorHeight: config.topHeight,
bottomIndicatorHeight: config.bottomHeight,
//恢复默认位置的动画时间
duration: 300,
//当前模式选择字段
refreshType: 'normal',
//是否有loadmore功能
useLoadMore: false,
//自定义上下拉显示的view
customView: null,
customBottomView: null,
```
- 方法

```
refreshed  ()    //刷新完成后调用
loaded  ()      //加载更多完成后调用
```

### 四、遇到的问题
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

### 五、对于一些使用问题的解决方法：

 1. 外层有scrollView时，由于scrollView事件响应很霸道，不能被拒绝，所以在上下拉动刷新时，依然会触发外层scrollView的滑动
解决方法：通过onStatusChange方法来判断当前的状态，来处理外部的可否滑动

有任何问题请留言，
