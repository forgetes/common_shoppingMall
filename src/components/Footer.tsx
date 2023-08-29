import { Container } from "@mui/material";

const Footer = () => {
    return (
        <footer>
            <Container maxWidth="lg" sx={{ mt: 1, mb: 1, textAlign: 'left'}}>
                <nav>
                    <a href='https://blog.naver.com/forgetes' target='_blank'>Blog</a>
                    &nbsp;|&nbsp;
                    <a href='https://github.com/forgetes' target='_blank'>Github</a>
                </nav>
                <p>
                    <span>저자 : 윤영준</span><br/>
                    <span>이메일 : forgetes@naver.com</span><br/>
                    <span>Copyright 2023. forgetes. All Rights Reserved.</span>
                </p>
            </Container>
        </footer>
    )
}

export {Footer};