import React, { Component, PropTypes } from 'react';
import { Image, StyleSheet, Text, TouchableHighlight, View, ListView} from 'react-native';
import { Icon } from 'react-native-icons';
import { getExtension } from './../../utils/functions';
import Video from 'react-native-video';

export default class MediaItem extends Component {

  renderContent(media) {
    const {caption,url} = media;
    return (
      <View style={styles.container}>
        <View>
          {url ? getExtension(url) == 'jpg' ? <Image style={styles.img} source={{uri:url}}/> :
            <Video source={{uri: url}}
                   style={styles.fullScreen}
                   repeat={false}
            />
            : <View/> }
        </View>

        <View>
          <Text style={{ padding:10, textAlign:"center" }}>{caption}</Text>
        </View>
      </View>
    )
  }

  render() {

    const {media} = this.props;

    if (media.id && media.id > 0) {
      return this.renderContent(media);
    }
    return <View/>;
  }

}

const styles = StyleSheet.create({

  container: {
    padding:5
  },
  img: {
    height: 200,
    borderRadius: 5,
    paddingTop: 10
  },
  fullScreen: {
    flex:1,
    position: 'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0,
    backgroundColor:'black'
  },
});
