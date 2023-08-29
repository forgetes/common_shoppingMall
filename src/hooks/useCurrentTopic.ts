import {useEffect, useState} from "react";
import { fetchDetailTopic } from "../fetcher/fetchers";
import { Repo } from "../pages";

type exception = {isError: boolean, notFound: boolean}

function useCurrentTopic(isReady: boolean, idx: string, isLike: boolean): Repo & exception {
  const [topic, setTopic] = useState<Repo>();
  const [isError, setIsError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if(!isReady || idx === 'undefined') return;
    fetchDetailTopic(idx).
    then((res) => {
      if(!res) {
        setNotFound(true);
        return;
      }
      setTopic(res);
    })
    .catch((err) => {
      setIsError(true);
      console.log(err);
    })
  },[idx, isReady]) 

  useEffect(() => {
    setTopic((prev) => {
      if(!prev) return;
      return {...prev, like: isLike}
    });
  }, [isLike])

  return {
    ...topic
    ,isError
    ,notFound
  };
}

export default useCurrentTopic;
