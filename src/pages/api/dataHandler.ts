// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { Repo } from "..";
import data from "../../../public/data/topic.json"
import firebaseDB from "../../util/firebaseDB";
import { addDoc, collection, getDocs } from "firebase/firestore";

export type TopicToLike = {
  uniqueId: string;
  id: string;
  like: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Repo[]>) {

  const {currentPage, perPage, category, search} = req.query;
  const {db} = firebaseDB();

  //console.log(currentPage, perPage, category, search)

  const _currentPage = Number(currentPage)
  const _perPage = Number(perPage)
  const _search: string = search ? search.toString().toLowerCase() : '';

  try{
    let list: Repo[] = (category && category !== '전체') ? data.filter(val => {
      if(val.grade === category){
        return val
      }
    }) : data;

    if(_search){
      list = list.filter(val => {
        if(val.title.toLowerCase().indexOf(_search) > -1){
          return val
        }
      })
    }

    list = list.filter((item, index) => {
      const reer = (_currentPage - 1) * _perPage;
      const tailer = _currentPage * _perPage;

      if(index >= reer && index < tailer){
        return item
      }
    })

    let topicToLikes: TopicToLike[] = [];
    try{
      const querySnapshot = await getDocs(collection(db, "topic"));
      topicToLikes = querySnapshot.docs.map((doc) => {
        return {uniqueId: doc.id, ...doc.data()} as TopicToLike;
      })
  
    }
    catch(e){
      topicToLikes = [];
      console.log('err is ', e)
    }

    //console.log('list.length', list.length)
    let willAddList: string[] = [];

    if(topicToLikes.length){
      list = list.map(val => {
        const topicToLike = topicToLikes.filter(topicToLike => topicToLike.id === val.idx)?.[0];
        if(topicToLike){
          val.like = topicToLike.like;
          val.uniqueId = topicToLike.uniqueId;
        }
        else{
          willAddList.push(val.idx);
        }
        return val;
      })
    }

    if(willAddList.length){
      willAddList.forEach(async val => {
        await addDoc(collection(db, "topic"), {
          id: val,
          like: false
        });
      })
    }

    res.status(200).json(list);
  }
  catch(err){
    console.log('err', err)
    res.status(500).json([]);
  }
}
