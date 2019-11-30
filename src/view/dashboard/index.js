import React from "react";
import "./dashboard.css";
import firebaseService from "../../firebase";
import firebase from 'firebase'
import { getRandom } from "../../service";
import { Row, Col } from "reactstrap";

export class Dashboard extends React.Component {

    state = {
        username: '',
        password: '',
        displayName: '',
        isLoggedIn: false,
        isCheckingVersion: true,
        logginVisible: true,
        oldVersion: false,
        randomNumber: 0,
        user: {
            displayName: '',
            uid: ''
        },
        isGenerating: false,
        currentGame: '',
        scoreBoardList: [],
        isExisted: false,
        existedNumber: 0
    }

    constructor(props) {
        super(props)
        this.loginContainer = React.createRef()
        this.contentContainer = React.createRef()
        this.checkVersion()
    }

    checkVersion = () => {
        console.log('checkVersion', process.env.REACT_APP_VERSION)
        firebaseService.database().ref('/version').on('value', (snapshot) => {
            let val = snapshot.val()
            console.log('version', val)
            this.setState({ isCheckingVersion: false })
            const currentVersion = process.env.REACT_APP_VERSION
            if (currentVersion != val) {
                this.setState({
                    oldVersion: true,
                    isLoggedIn: false,
                    logginVisible: true,
                })
            }
        })
    }

    componentDidMount() {
        firebaseService.database().ref('/current-game').on('value', (snapshot) => {
            let val = snapshot.val()
            if (this.state.currentGame != val) {
                let oldCurrentGame = this.state.currentGame
                this.setState({ currentGame: val })
                this.resetListener(oldCurrentGame)
            }
        })
    }

    onCheckExisted = () => {
        firebaseService.database().ref('/generate-game/' + this.state.currentGame + '/').on('value', (snapshot) => {
            const val = snapshot.val()
            if (val) {
                let result = Object.keys(val).find(a => a == this.state.user.uid)
                if (result) {
                    this.setState({ isExisted: true, existedNumber: Number(val[result].number) })
                } else {
                    this.setState({ isExisted: false, existedNumber: 0 })
                }
            } else {
                this.setState({ isExisted: false, existedNumber: 0 })
            }
        })
    }

    onScoreboardListener = () => {
        firebaseService.database().ref('/generate-game/' + this.state.currentGame + '/').on('value', (snapshot) => {
            const val = snapshot.val()
            if (val) {
                let result = Object.keys(val).map((a, b) => {
                    return { ...val[a] }

                })
                result.sort((a, b) => {
                    if (a.number < b.number) return 1
                    else if (a.number == b.number) return 0
                    else return -1
                })
                this.setState({ scoreBoardList: result })
            } else {
                this.setState({ scoreBoardList: [] })
            }
        })
    }

    resetListener = (oldCurrentGame) => {
        firebaseService.database().ref('/generate-game/' + oldCurrentGame + '/').off("value")
        this.onScoreboardListener()
        this.onCheckExisted()
    }

    login = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            'hd': 'adamodigital.com'
        });
        firebaseService.auth().languageCode = 'vi';
        firebaseService.auth().signInWithPopup(provider)
            .then((result) => {
                var user = result.user;
                this.setState({ user: user })
                this.onCheckExisted()
                setTimeout(() => {
                    this.setState({ isLoggedIn: true })
                    this.loginContainer.current.classList.toggle('faded-out')
                }, 1000)
                setTimeout(() => {
                    this.onScoreboardListener()
                    this.contentContainer.current.classList.toggle('faded-in')
                }, 2000)
                setTimeout(() => {
                    this.setState({ logginVisible: false })

                }, 4000)
            })
            .catch(function (error) {
                console.log('err', error)
            });
    }

    generateRandom = () => {
        this.setState({ isGenerating: true })
        getRandom((number) => {
            this.setState({ randomNumber: number, isGenerating: false })
            if (!this.state.isExisted) {
                firebaseService.database().ref('/generate-game/' + this.state.currentGame + '/' + this.state.user.uid + '/').set({
                    number: number,
                    create_at: new Date().toString(),
                    name: this.state.user.displayName
                })
            } else {
                firebaseService.database().ref('/error-game/' + this.state.currentGame + '/' + this.state.user.uid + '/').set({
                    number: number,
                    create_at: new Date().toString(),
                    name: this.state.user.displayName
                })
            }
        })
    }

    render() {
        const { scoreBoardList, isLoggedIn, logginVisible, isGenerating, user, isExisted, existedNumber, oldVersion, isCheckingVersion } = this.state
        return (
            <div className="fit-body">
                {logginVisible && < div className="loginContainer" ref={this.loginContainer}>
                    <div className="bg-image"></div>
                    <div className="loginContent">
                        {!oldVersion && (!isCheckingVersion && <div className="text-center">
                            {user.displayName === '' ? <button onClick={this.login}>Đăng nhập với Google</button> :
                                <span>Xin chào {user.displayName}</span>
                            }
                        </div> || <span>Đang kiểm tra phiên bản...</span>)}
                        {oldVersion && !isCheckingVersion && <div className="text-center"><span>Refresh lại trang để kiểm tra nhân phẩm</span></div>}
                    </div>
                </div>}
                <div className="contentContainer" ref={this.contentContainer}>
                    {isLoggedIn && !oldVersion && <Row className="contentChildContainer">
                        <Col md={8} className="generate-box">
                            <div style={{ height: 40 }}>{isGenerating && <p>Đang Kiểm Tra Nhân Phẩm....</p>}</div>
                            <p className="generate-number">{existedNumber}</p>
                            <div>
                                <button disabled={isExisted || isGenerating} onClick={this.generateRandom}>{isExisted ? `Bạn đã biết nhân phẩm thế nào rồi` : `Test nhân phẩm thôi`}</button>
                            </div>
                        </Col>
                        <Col md={4}>
                            <p>Bảng vàng</p>
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>No</th>
                                        <th style={{ width: '40%' }}>Tên</th>
                                        <th style={{ width: '40%' }}>Nhân phẩm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoreBoardList && scoreBoardList.map((a, b) => {
                                        return (
                                            <tr key={b}>
                                                <td>{b + 1}</td>
                                                <td>{a.name}</td>
                                                <td>{a.number}</td>
                                            </tr>
                                        )

                                    })}
                                </tbody>
                            </table>
                        </Col>
                    </Row>}
                </div>

                {isLoggedIn && !oldVersion && <div className="footer">
                    <span>Số ngẫu nhiên được lấy từ API Random.org chứ mình không bốc phét ra</span>
                </div>}
            </div >
        )
    }
}