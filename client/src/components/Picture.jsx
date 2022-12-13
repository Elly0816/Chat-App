




export default function Picture(props){



    return <img onClick={props.onClick} title={props.title} className={props.mine} src={props.src} alt={props.alt + ' profile image'}></img>
}