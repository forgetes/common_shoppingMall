// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { Repo } from "..";
import data from "../../../public/data/topic.json" assert { type: 'json'}
import { collection, getDocs } from "firebase/firestore";
import firebaseDB from "../../util/firebaseDB";
import { TopicToLike } from "./dataHandler";

export default async function detailHandler(req: NextApiRequest, res: NextApiResponse<Repo | {}>){

  const {idx} = req.query;
  const {db} = firebaseDB();
  let detail: Repo | undefined | {} = {};

  try{
    detail = data.filter(val => val.idx === idx)?.[0];

    let topicToLikes = [];

    try{
      const querySnapshot = await getDocs(collection(db, "topic"));
      topicToLikes = querySnapshot.docs.map((doc) => {
        return {uniqueId: doc.id, ...doc.data()} as TopicToLike;
      })
    }
    catch(e){
      topicToLikes = [];
      console.log('detail handler error', e);
    }

    topicToLikes.forEach((val) => {
      if(val.id === idx){
        detail = {...detail, like: val.like, uniqueId: val.uniqueId}
      }
    });
    
    res.status(200).json(detail);
  }
  catch(err){
    console.log('err', err)
    res.status(500).json({});
  }
}
