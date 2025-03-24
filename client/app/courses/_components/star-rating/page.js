import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import PropTypes from 'prop-types'
import styles from './star-rating.module.scss'

export default function StarRating({ rating=0 }) {
  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className={styles['star-warning']} />)
      } else if (rating > i - 1) {
        stars.push(<FaStarHalfAlt key={i} className={styles['star-warning']} />)
      } else {
        stars.push(<FaRegStar key={i} className={styles['star-warning']} />)
      }
    }
    return stars
  }

  return <div className="d-flex">{renderStars()}</div>
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
}
