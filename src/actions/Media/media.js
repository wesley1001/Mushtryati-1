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

function mediaSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.MEDIA_ARRAY);
  return {
    type: MEDIA_SUCCESS,
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
          dispatch(mediaSuccess(json));
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

function mediaSaveSuccess() {
  return {
    type: MEDIA_SAVE_SUCCESS
  }
}

export function saveMedia(uri) {
  return (dispatch,state) => {

    dispatch({type:MEDIA_SAVE_REQUEST});

    const params = {
      uri : uri
    };

    return getUserToken().then((token) => {
      const url = API_ROOT + `/medias?api_token=${token}`;
      return fetch(url,{
        method:'POST',
        body: JSON.stringify(params)
      })
        .then(response => response.json())
        .then(json => {
          if(!json.success) {
            Promise.reject(new Error(json.message));
          }
          dispatch(mediaSaveSuccess())
            .then(()=>dispatch(mediaSuccess(json)))
            .then(()=>dispatch(setCurrentMedia(json.data.id)));
        })
        .catch((err)=> {
          dispatch({type: MEDIA_SAVE_FAILURE, error: err});
        })
    })
  }
}
