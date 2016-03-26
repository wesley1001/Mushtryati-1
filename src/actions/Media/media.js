import { API_ROOT } from './../../constants/config';
import { normalize, Schema, arrayOf } from 'normalizr';
import { Schemas } from './../../utils/schema';
import { getUserToken } from './../../utils/storage';
import {
  MEDIA_SUCCESS,
  MEDIA_REQUEST,
  MEDIA_FAILURE,
  MEDIA_SAVE_SUCCESS,
  MEDIA_SAVE_REQUEST,
  MEDIA_SAVE_FAILURE,

  SET_CURRENT_MEDIA
} from '../../constants/actiontypes';

function mediasSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.MEDIA_ARRAY);
  return {
    type: MEDIA_SAVE_SUCCESS,
    entities: normalized.entities
  }
}

function mediaSaveSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.MEDIA);
  return {
    type: MEDIA_SAVE_SUCCESS,
    entities: normalized.entities
  }
}

export function fetchMedia() {
  return (dispatch,state) => {

    const mediaID = state().mediaReducer.current;

    if(state().entities.medias[mediaID]) {
      return;
    }

    dispatch({type:MEDIA_REQUEST});

    return getUserToken().then((token) => {
      const url = API_ROOT + `/medias/${mediaID}?api_token=${token}`;
      return fetch(url)
        .then(response => response.json())
        .then(json => {
          dispatch(mediasSuccess(json));
        })
        .catch((err)=> {
          dispatch({type: MEDIA_FAILURE, error: err});
        })
    })
  }
}

export function setCurrentMedia(mediaID) {
  return (dispatch) => {
    dispatch({type: SET_CURRENT_MEDIA, current: mediaID});
  }
}

export function saveMedia(uri) {
  return (dispatch) => {

    dispatch({type:MEDIA_SAVE_REQUEST});

    var xhr = new XMLHttpRequest;

    xhr.onreadystatechange = (e) => {

      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);

        dispatch(mediaSaveSuccess(json));
      } else {
        //var json = JSON.parse(xhr.response);

        dispatch({type: MEDIA_SAVE_FAILURE, error: xhr.response});
      }
    };

    var photo = {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg'
    };

    return getUserToken().then((token) => {
      const url = API_ROOT + `/medias?api_token=${token}`;
      var body = new FormData();
      body.append('api_token', token);
      body.append('photo', photo);
      xhr.open('POST', url);
      xhr.send(body);
      return true;

      //return fetch(url,{
      //  method:'POST',
      //  body: data
      //})
      //  .then(response => response.json())
      //  .then(json => {
      //    console.log('json',json);
      //    if(!json.success) {
      //      return Promise.reject(new Error(json.message));
      //    }
      //    json.user = state().entities.users[state().userReducer.current];
      //    dispatch(mediaSaveSuccess())
      //      .then(()=>dispatch(mediaSuccess(json)))
      //      .then(()=>dispatch(setCurrentMedia(json.data.id)));
      //  })
      //  .catch((err)=> {
      //    dispatch({type: MEDIA_SAVE_FAILURE, error: err});
      //  })
    })
  }
}
