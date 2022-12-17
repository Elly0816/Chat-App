




export default function Picture(props){



    return <div className={props.divClassName}>
        <img onClick={props.handleClick ? props.handleClick : () => {}} className={props.mine} title={props.title} src={props.src ? props.src : 'def-prof-pic.jpg'} alt={props.alt + ' profile image'}></img>
        {props.canInput && <input style={{display: 'none'}} ref={props.inputRef} accept="image/*" title={props.title} alt='change profile picture' type='file' onChange={props.handleChange}/>}
        {/* {props.canInput && <button onClick={props.handleClick}>Change Image</button>} */}
    </div>
}