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
import { JBRefreshView ,JBRefreshConfig} from 'component'
```
JBRefreshConfig可选，用来配置一些属性，默认来说，上下拉刷新组件都是统一制定好的，所以一般不用再去特殊配置。

- ScrollView
直接使用JBRefreshView替换scrollView
```
<View style={[styles.container]}>
<JBRefreshView
onRefresh={this.onRefresh}
useLoadMore={false}
refreshType='normal'
styleType='light'
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
重写listview的内部scrollview用JBRefreshView替代
```
<View style={styles.container}>
<ListView
renderScrollComponent={(props) =>
<JBRefreshView
onRefresh={(PullRefresh) => this.onRefresh(PullRefresh)}
onLoadmore={(PullRefresh) => this.onLoadmore(PullRefresh)}
useLoadMore={true}
refreshType='normal'
styleType='light'
{...props}
/>}
dataSource={this.state.dataSource}
renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
renderRow={(rowData) => <View style={styles.rowItem}><Text style={{ fontSize: 16 }}>{rowData}</Text></View>}
/>
</View>
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
noMoreData  ()  //没有更多的时候调用
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
```
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
```

其中：
```
onStartShouldSetPanResponderCapture
onMoveShouldSetPanResponderCapture
```
在iOS端是可以阻止子view获取事件监听，安卓端无效。
所以在第二版中使用这种方法来切换层级之间的事件响应，做好之后发现安卓不好使，导致浪费了时间和精力。
