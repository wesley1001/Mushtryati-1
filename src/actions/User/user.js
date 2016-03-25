import { API_ROOT } from './../../constants/config';
import { normalize, Schema, arrayOf } from 'normalizr';
import { Schemas } from './../../utils/schema';
import { getUserToken } from './../../utils/storage';
import union from 'lodash/union';

import {
  USER_REQUEST,
  USER_SUCCESS,
  USER_FAILURE,
  USER_MEDIAS_REQUEST,
  USER_MEDIAS_SUCCESS,
  USER_MEDIAS_FAILURE,
  USER_FOLLOWINGS_REQUEST,
  USER_FOLLOWINGS_SUCCESS,
  USER_FOLLOWINGS_FAILURE,
  USER_FOLLOWERS_REQUEST,
  USER_FOLLOWERS_SUCCESS,
  USER_FOLLOWERS_FAILURE,
  SET_CURRENT_USER
} from './../../constants/actiontypes';

function userSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.USER);
  return {
    type: USER_SUCCESS,
    entities: normalized.entities
  }
}

function userMediasSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.USER);
  return {
    type: USER_MEDIAS_SUCCESS,
    entities: normalized.entities
  }
}

function userFollowingsSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.USER);
  return {
    type: USER_FOLLOWINGS_SUCCESS,
    entities: normalized.entities
  }
}

function userFollowersSuccess(payload) {
  const normalized = normalize(payload.data, Schemas.USER);
  return {
    type: USER_FOLLOWERS_SUCCESS,
    entities: normalized.entities
  }
}

export function setCurrentUser(id) {
  return (dispatch) => {
    dispatch({type:SET_CURRENT_USER,current:id});
  }
}

export function fetchUser() {
  return (dispatch,state) => {
    dispatch({type:USER_REQUEST});
    const currentID = state().userReducer.current;
    return getUserToken().then((token) => {
        const url = API_ROOT + `/users/${currentID}?api_token=${token}`;
        return fetch(url)
          .then(response => response.json())
          .then(json => {
            dispatch(userSuccess(json));
          })
      })
      .catch((err)=> {
        dispatch({type:USER_FAILURE,error:err});
      })
  }
}

export function fetchUserMedias() {
  return (dispatch,state) => {
    dispatch({type:USER_MEDIAS_REQUEST});
    const currentID = state().userReducer.current;
    return getUserToken().then((token) => {
        const url = API_ROOT + `/users/${currentID}/medias?api_token=${token}`;
        return fetch(url)
          .then(response => response.json())
          .then(json => {
            dispatch(userMediasSuccess(json));
          })
      })
      .catch((err)=> {
        dispatch({type:USER_MEDIAS_FAILURE,error:err});
      })
  }
}

export function fetchUserFollowings() {
  return (dispatch,state) => {
    dispatch({type:USER_FOLLOWINGS_REQUEST});
    const currentID = state().userReducer.current;
    return getUserToken().then((token) => {
        const url = API_ROOT + `/users/${currentID}/followings?api_token=${token}`;
        return fetch(url)
          .then(response => response.json())
          .then(json => {
            dispatch(userFollowingsSuccess(json));
          })
      })
      .catch((err)=> {
        dispatch({type:USER_FOLLOWINGS_FAILURE,error:err});
      })
  }
}

export function fetchUserFollowers() {
  return (dispatch,state) => {
    dispatch({type:USER_FOLLOWERS_REQUEST});
    const currentID = state().userReducer.current;
    return getUserToken().then((token) => {
        const url = API_ROOT + `/users/${currentID}/followers?api_token=${token}`;
        console.log(url);
        return fetch(url)
          .then(response => response.json())
          .then(json => {
            dispatch(userFollowersSuccess(json));
          })
      })
      .catch((err)=> {
        dispatch({type:USER_FOLLOWERS_FAILURE,error:err});
      })
  }
}

function updateFollowers(authUser,followee) {
  const followings = authUser.followings ? authUser.followings : [];
  authUser.followings = followee.isFollowing ? followings.filter((followingID) => followingID != followee.id) : union(followings,[followee.id]) ;
  const normalized = normalize(authUser,Schemas.USER);
  return {
    type: USER_FOLLOWERS_SUCCESS,
    entities: normalized.entities
  }
}

function updateFollowee(followee) {
  followee.isFollowing = !followee.isFollowing;
  followee.unFollowed = followee.isFollowing ? false : true;
  const normalized = normalize(followee,Schemas.USER);
  return {
    type: USER_FOLLOWERS_SUCCESS,
    entities: normalized.entities
  }
}

export function followUser(userID) {
  return (dispatch,state) => {

    const followeeID = userID;
    const authUserID = state().userReducer.authUserID;

    const followee = Object.assign({},state().entities.users[followeeID]);
    const authUser = Object.assign({},state().entities.users[authUserID]);

    const params = {
      follower:followeeID
    };

    dispatch(updateFollowers(authUser,followee));
    dispatch(updateFollowee(followee));

    return getUserToken().then((token) => {
      const url = API_ROOT + `/follow?api_token=${token}`;
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params)
      })
        .then(response => response.json())
        .then(json => {
        }).catch((err)=> console.log(err))
    })
  }
}

