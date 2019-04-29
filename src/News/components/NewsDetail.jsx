import React, { Component } from 'react';
import '../styles/NewsDetail.scss';
import { Button, Empty, Tag, Breadcrumb, Icon, Divider, Avatar, message} from 'antd';
import { Link } from 'react-router-dom'
import {decorate} from "mobx";
import {observer} from "mobx-react";
import UserStore from "../../Appshell/stores/UserStore";
import axios from 'axios';
import Image from "./Image";


class NewsDetail extends Component {
  constructor(){
    super();
    this.state = {
      currentNews: {},
      following: false,
      visible: false
    }
  }

  componentDidMount() {
    // need to get news by id
    let id = this.props.match.params.id;
    const params = {};
    if (!UserStore.user.isAnonymous && UserStore.user.uid) {
      params.uid = UserStore.user.uid;
    }
    axios.get(`http://localhost:3000/api/offline/${id}`, {params: params}).then(
      res => {
        this.setState({
          currentNews: res.data,
        })
      }
    );
  }

  handleFollow = () => {
    axios.put(`http://localhost:3000/api/user/${UserStore.user.uid}`,
        {name: this.state.currentNews.source, type:"source"}).then(res => {
      this.setState({following: !this.state.following});
    }).catch(err =>
        message.error("Network error")
    );
  };

  isFollow = () => {
    if (!UserStore.user.channels) return false;
    let key = 'headline';
    if (this.props.location) {
      const search = this.props.location.search;
      const params = new URLSearchParams(search);
      key = params.get('news') || params.get('category') || params.get('source') || 'headline';
    }

    return (key in UserStore.user.channels) || this.state.following;
  };

  renderBody = (body) => {
    body = body.replace(new RegExp(/\r\n/g,'g'), '<br />');
    return body.split('\n').map((item, index) =>
        <span key={index}>
          {item}
          <br/>
        </span>
    )
  };

  render() {
    const {currentNews} = this.state;
    if (Object.keys(currentNews).length === 0) {
      return <div className="detail-container">
          <Empty/>
      </div>
    }

    return (
      <div className="detail-container">
        <div className="breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><Icon type="home"/> Home</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/news"><Icon type="rise" /> News</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{currentNews.title}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="title"><h1>{currentNews.title}</h1></div>
        <div className="article-info">
          <Avatar
            size={64}
            style={{fontSize: '30px', color: '#13c2c2', backgroundColor: '#e6fffb'}}>
            {currentNews.source[0]}
          </Avatar>
          <div className="article-subtitle">
            <div className="source">{currentNews.source}</div>
            <div className="post-time">Post Time: {currentNews.time}</div>
          </div>
          <div className="article-follow">
            <Button shape="round" onClick={this.handleFollow} disabled={UserStore.user.isAnonymous}>
              <Icon type="star" theme={this.isFollow() ? "filled" : ""}/>
              {this.isFollow() ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </div>


        <div className="article-img">
          <Image type={"detail"} address={currentNews.img} source={currentNews.source}/>
        </div>
        <div className="tags">Category: <Tag color="cyan">{currentNews.category}</Tag></div>
        <div className="description">Description: {currentNews.summary}</div>

        <Divider/>
        <div className="content">{this.renderBody(currentNews.body)}</div>
        <Divider/>
      </div>

    )
  }
}

decorate(NewsDetail, {
  NewsDetail: observer,
});

export default NewsDetail