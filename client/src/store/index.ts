/*
 * @Author: qianlong github:https://github.com/LINGyue-dot
 * @Date: 2021-12-03 15:19:58
 * @LastEditors: qianlong github:https://github.com/LINGyue-dot
 * @LastEditTime: 2021-12-10 11:19:24
 * @Description:
 */
import { postLogin, alreadyUsername, postRegister } from "@/htpp/api";
import router from "@/router";
import { UserInfoProp } from "@/types/types";
import { loginStorage, logoutStorage } from "@/util/storgae";
import { Toast } from "vant";
import { createStore, storeKey } from "vuex";
import { getBallList } from "@/htpp/post";

export interface StateProp {
  login: boolean;
  userId: undefined | string;
  userInfo: undefined | Partial<UserInfoProp>;
  ballList: any[];
}

export default createStore<StateProp>({
  state: {
    login: !!localStorage.getItem("userId"),
    userId: localStorage.getItem("userId") || undefined,
    userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}") || {},
    ballList: [],
  },
  mutations: {
    changeLogin(state, payload) {
      state.login = payload;
    },
    changeUserId(state, payload) {
      state.userId = payload;
    },
    changeUserInfo(state, payload) {
      state.userInfo = payload;
    },
    changeBallList(state, payload) {
      state.ballList = payload;
    },
  },
  actions: {
    async login({ commit }, data) {
      const res = (await postLogin(data)) as any;
      if (res) {
        // 登录成功
        commit("changeUserId", res.userId);
        commit("changeLogin", true);
        commit("changeUserInfo", res);
        loginStorage(res);
        router.push("/home");
        return true;
      }
      return false;
    },
    async register({ commit }, data) {
      const res = (await alreadyUsername(data)) as any;

      if (res) {
        //  没有重名
        const response = (await postRegister(data)) as any;
        if (response) {
          commit("changeLogin", true);
          commit("changeUserId", response.userId);
          commit("changeUserInfo", response);
          loginStorage(response);
          router.push("/update-profile");
          return true;
        }
      }
      return false;
    },
    logout({ commit }) {
      commit("changeLogin", false);
      commit("changeUserId", "");
      commit("changeUserInfo", {});
      logoutStorage();
      Toast({
        message: "退出成功",
        position: "top",
      });
      router.replace("/login");
    },
    updateProfile({ commit }, payload) {
      loginStorage(payload);
      commit("changeUserInfo", payload);
    },
    async findBall({ state, commit }, payload) {
      if (state.ballList.length == 0) {
        const data = await getBallList();
        commit("changeBallList", data);
      }
      let name = "其他";
      state.ballList.forEach(ball => {
        if (ball.ballId == payload) {
          name = ball.ballType;
        }
      });
      return name;
    },
  },
  modules: {},
});
