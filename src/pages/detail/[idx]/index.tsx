'use client'

import { Button, Container, Grid, Skeleton, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import styles from '../../../styles/detail.module.css'
import firebaseDB from "../../../util/firebaseDB";
import { doc, updateDoc } from "firebase/firestore";
import useCurrentTopic from "../../../hooks/useCurrentTopic";
import { useMainDispatch } from "../../../context/MainContext";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const dispatch = useMainDispatch();

  const idx = router.query.idx as string;
  const isReady = router.isReady;
  const firebaseDbRef = useRef(null);
  const [isLike, setIsLike] = useState<boolean>(false);
  const {...topic} = useCurrentTopic(isReady, idx, isLike)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    firebaseDbRef.current = firebaseDB();

    router.beforePopState(() => {
      dispatch({type: 'SET_HISTORY_BACK', historyBack: true})
      return true;
    });
  },[]);

  useEffect(() => {
    if(topic.isError){
      alert('토픽을 불러오는데 실패했습니다.');
      router.push('/');
    }
    if(topic.notFound){
      alert('토픽을 찾을 수 없습니다.');
      router.push('/');
    }
    if(topic.imgPath){
      setIsLoading(false);
    }
  },[topic.isError, topic.notFound, topic.imgPath]);

  const onClickLike = async () => {
    try{
      const heartAction = doc(firebaseDbRef.current?.db, 'topic', topic.uniqueId);
      updateDoc(heartAction, {
        like: !topic.like
      })
      .then((res) => {
        console.log(res)
        setIsLike(!topic.like)
      });
    }
    catch(e){
      alert('좋아요를 누르는데 실패했습니다.');
      console.log(e);
    }
  }

  return (
    <Container maxWidth={'lg'} sx={{ mt: 1, mb: 1}}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={6}>
          {
            isLoading ? 
            (
              <Skeleton
                sx={{ bgcolor: 'grey.700' }}
                variant="rectangular"
                width={500}
                height={800}
              />
            )
            : <img
                src={topic?.imgPath} 
                alt={topic?.title} 
                className={styles.img_stack}/>
          }
        </Grid>
        <Grid item xs={6} md={6}>
          <Stack spacing={1}>
            <span className={styles.title}>
              {topic.title}
            </span>
            <span className={styles.headline}>풀이등급</span>
            <span>{topic.grade}</span>
            <span></span>
            <span className={styles.headline}>설명</span>
            <span>
            AJ5는 많은 시즌을 거쳐 오래도록 사랑받는 스타일의 중심을 지켜왔습니다. 많은 사랑을 
            받은 팅커 햇필드 디자인이 마이클 조던의 초창기 시절을 기념하는 대학 컬러웨이로 돌아왔습니다.
            갑피부터 안창까지 적용된 유니버시티 블루 컬러는 조던의 모교를 기념하며,
            뒷면의 &quot;Team Jordan&quot; 우븐 라벨이 액센트를 더해줍니다. 새롭게 적용된 안감이 진정한 편안함을 선사하며 옆면 트임, 
            스파이키 중창, 레이스 락 등 오리지널의 완벽한 디테일이 모두가 사랑하는 클래식한 매력과 멋진 조화를 이룹니다.
            </span>
            <span>
              <Button variant="contained" onClick={onClickLike}>
                Wish&nbsp;{ topic.like ? <FavoriteIcon /> : <FavoriteBorderIcon/>}
              </Button>
            </span>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}