import { createContext, Dispatch, useContext, useReducer } from 'react';
import { Repo } from '../pages';

export type ContextType = {
  tabIndex: number;
  topicList: Repo[];
  initTopicList?: boolean;
  historyBack: boolean;
  currentScroll: number;
}

type MainState = ContextType;

type Action = 
| { type: 'SET_CURRENT_SCROLL', currentScroll: number }
| { type: 'SET_HISTORY_BACK', historyBack: boolean }
| { type: 'SET_TAB_INDEX', idx: number }
| { type: 'SET_TOPIC_LIST', topicList: Repo[], initTopicList?: boolean };


type MainDispatch = Dispatch<Action>;

const MainStateContext = createContext<MainState | null>(null);
const MainDispatchContext = createContext<MainDispatch | null>(null);

function reducer(state: MainState, action: Action): MainState {
  switch (action.type) {
    case 'SET_TAB_INDEX':
      return {
        ...state,
        tabIndex: action.idx,
      }
    case 'SET_TOPIC_LIST':
      if(action.initTopicList){
        return {
          ...state,
          topicList: [...action.topicList],
        } 
      }
      else{
        return {
          ...state,
          topicList: [...state.topicList, ...action.topicList],
        }  
      }
    case 'SET_HISTORY_BACK':
      return {
        ...state,
        historyBack: action.historyBack,
      }  
    case 'SET_CURRENT_SCROLL':
      return {
        ...state,
        currentScroll: action.currentScroll,
      }  
    default:
      return state;
  }
}

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer,
     {
      tabIndex: 5, 
      topicList: [], 
      initTopicList: false, 
      historyBack: false,
      currentScroll: 0,
    });

  return (
    <MainStateContext.Provider value={state}>
      <MainDispatchContext.Provider value={dispatch}>
        {children}
      </MainDispatchContext.Provider>
    </MainStateContext.Provider>
  );
}

export function useMainState() {
  const state = useContext(MainStateContext);
  if (!state) throw new Error('Cannot find SampleProvider'); // 유효하지 않을땐 에러를 발생
  return state;
}

export function useMainDispatch() {
  const dispatch = useContext(MainDispatchContext);
  if (!dispatch) throw new Error('Cannot find SampleProvider'); // 유효하지 않을땐 에러를 발생
  return dispatch;
}