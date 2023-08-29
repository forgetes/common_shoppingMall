import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import React, { 
  useEffect, 
  useRef,
  useState,
  useCallback,
  ChangeEvent,
  SyntheticEvent, 
} from 'react'
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia,
  Container, 
  Stack, 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  IconButton, 
  InputBase, 
  Paper,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Snackbar
 } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '../hooks/useDebounce'
import { fetchTopicList } from '../fetcher/fetchers'
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router'
import styles from '../styles/Index.module.css'
import firebaseDB from '../util/firebaseDB'
import { doc, updateDoc } from 'firebase/firestore'
import { useMainDispatch, useMainState } from '../context/MainContext';

export type Repo = {
  title: string;
  idx: string;
  imgPath: string;
  grade: string;
  like?: boolean;
  uniqueId?: string;
}

export default function Home({repo}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>(null);
  const [searchTerm, setSearchTerm] = useState<string>(null);
  const [isProgress, setProgress] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const lastDiv = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const firebaseDbRef= useRef(null);

  const router = useRouter();
  const dispatch = useMainDispatch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const {
    tabIndex, 
    topicList, 
    historyBack, 
    currentScroll
  } = useMainState();

  const TOPIC_CATEGORY_LIST = ['입문','초급', '중급', '중고급', '고급', '전체'];
  const PER_PAGE = 20;

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('intersecting')
            setCurrentPage((prev) => prev + 1);
            setProgress(true);
          }
        });
      },
      { threshold: 1 }
    )

    firebaseDbRef.current = firebaseDB();

    return () => observer.current.disconnect()
  },[]);

  useEffect(() => {
    if(historyBack){
      window.scrollTo(0, currentScroll);
      return;
    }
    dispatch({type: 'SET_TOPIC_LIST', topicList: repo, initTopicList: true})
  }, [repo, historyBack, currentScroll])

  useEffect(() => {
    const currentElement = lastDiv.current
    if (currentElement && isFetching) {
      observer?.current?.observe(currentElement)
    }
  },[topicList, tabIndex]);

  useEffect(() => {
    if(currentPage > 1 && isFetching){
      fetchTopicList(currentPage, PER_PAGE, TOPIC_CATEGORY_LIST[tabIndex], searchText === null ? '' : searchText).then((res) => {
        if(res.length === 0 && lastDiv?.current) {
          observer?.current?.unobserve(lastDiv?.current)
          setIsFetching(false);
        }
        dispatch({type: 'SET_TOPIC_LIST', topicList: res})
        setProgress(false);
      })
      .catch((e) => {
        console.log(e);
        setProgress(false);
      })
    }
  }, [currentPage, isFetching])

  useEffect(() => {
    if(searchTerm === null || searchText === null) return;
    fetchTopicList(1, PER_PAGE, TOPIC_CATEGORY_LIST[tabIndex], searchTerm).then((res) => {
      dispatch({type: 'SET_TOPIC_LIST', topicList: res, initTopicList: true})
      dispatch({type: 'SET_HISTORY_BACK', historyBack: false})
      dispatch({type: 'SET_CURRENT_SCROLL', currentScroll: 0})
      setIsFetching(true)
      setCurrentPage(1);
    })
  }, [searchTerm, searchText, tabIndex])

  useEffect(() => {
    // debouncedSearchTerm 값이 변경될 때마다 handleSearch 함수를 호출
    setSearchText(debouncedSearchTerm)
  }, [debouncedSearchTerm]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const onChangeTab = (e: SyntheticEvent, idx: number) => {
    if(idx === tabIndex) return;
    dispatch({type: 'SET_TAB_INDEX', idx});
    fetchTopicList(1, PER_PAGE, TOPIC_CATEGORY_LIST[idx], searchText === null ? '' : searchText).then((res) => {
      dispatch({type: 'SET_TOPIC_LIST', topicList: res, initTopicList: true})
      dispatch({type: 'SET_HISTORY_BACK', historyBack: false})
      dispatch({type: 'SET_CURRENT_SCROLL', currentScroll: 0})
      setIsFetching(true)
      setCurrentPage(1);
    })
  }

  const onClickCard = useCallback((idx: string) => {
    dispatch({type: 'SET_CURRENT_SCROLL', currentScroll: window.scrollY})
    router.push(`/detail/${idx}`, undefined, {shallow: true})
  }, [router])

  const onClickLike = async (idx: string, like: boolean, uniqueId: string) => {
    try{
      const heartAction = doc(firebaseDbRef.current?.db, 'topic', uniqueId);

      await updateDoc(heartAction, {
        like: !like
      });
    }
    catch(e){
      console.log(e);
    }

    const newTopicList = topicList.map((item) => {
      if(item.idx === idx) {
        return {
          ...item,
          like: !item.like
        }
      }
      return item;
    })
    //setTopicList(newTopicList);
    dispatch({type: 'SET_TOPIC_LIST', topicList: newTopicList, initTopicList: true})
  }

  const onShare = (idx: string) => {
    const hostname = location.href;
    setSnackbarOpen(true);
    setSnackbarMessage(`${hostname}detail/${idx}`)
  }

  const copy = () => {
    setSnackbarOpen(false)
    navigator.clipboard.writeText(snackbarMessage);
    setSnackbarMessage('');
  }

  const action = (
    <>
      <Button color="secondary" size="small" onClick={() => copy()}>
        Copy
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => setSnackbarOpen(false)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 1}}>
      <Stack spacing={{xs: 1}} alignItems={'center'}>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', minWidth: '500px'}}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="검색할 토픽을 입력해 주세요"
            inputProps={{ 'aria-label': 'search google maps' }}
            onChange={handleInputChange}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
          <Tabs value={tabIndex} onChange={onChangeTab}>
            {
              TOPIC_CATEGORY_LIST.map((item, index) => (
                <Tab label={item} key={item} sx={{ color: 'grey' }}/>
              ))
            }
          </Tabs>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          action={action}
        />
      </Stack>

      <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 12, sm: 12, md: 12 }}>
        {
          topicList.length > 0 ? topicList.map((item, idx) => (
            <Grid item xs={2} sm={4} md={4} key={item.idx}>
              <Card 
                  sx={{ maxWidth: 345 }} 
                  ref={topicList.length === idx+1 ? lastDiv : null}
                >
                  <CardActionArea>
                    <div className={`${styles.avt} ${styles.like}`} onClick={() => onClickLike(item.idx, item.like, item.uniqueId)}>
                      { item.like ? <FavoriteIcon /> : <FavoriteBorderIcon/>}
                    </div>
                    <div className={`${styles.avt} ${styles.grade}`}>
                      {item.grade}
                    </div>
                    <CardMedia
                      component="img"
                      height="300"
                      image={`${item.imgPath}`}
                      onClick={() => {onClickCard(item.idx)}}
                    />
                  </CardActionArea>
                  <CardContent>
                    <Grid container>
                      <Grid>
                        <Typography component="div" >
                          {item.title}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => onClickLike(item.idx, item.like, item.uniqueId)}>
                      {
                        item.like ? 'UNLIKE' : 'LIKE'
                      }
                    </Button>
                    <Button size="small" onClick={() => {onShare(item.idx)}}>Share</Button>
                  </CardActions>
              </Card>
            </Grid>
          ))
          : (
              <Grid item xs={12} style={{textAlign: 'center', margin: '30px'}}>
                <Typography gutterBottom variant="h5" component="div">
                  검색 된 토픽이 없습니다
                </Typography>
              </Grid>
            )
        }
        {
          isProgress && (
            <Grid item xs={12} style={{textAlign: 'center', margin: '30px'}}>
              <CircularProgress />
            </Grid>
          )
        }
      </Grid>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<{
  repo: Repo[],
}> = async ({req, res}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/api/dataHandler?currentPage=1&perPage=20`,
   {method: 'GET'})
  const repo = await response.json()

  return { props: { repo } }
}