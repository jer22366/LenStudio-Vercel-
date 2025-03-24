import styles from './product-details.module.scss';

export default function ProductDetails({ id, specs = [] }) {
  function toHalfWidth(str) {
    return str.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)); // 轉換全形字符
  }
  return (
    <div className="collapse" id={`collapseExample${id}`}>
      <div className={`card card-body ${styles['j-bodyContent']}`}>
        {specs?.map((spec, index) => (
          <div key={index}>
            <h5>{spec.title}</h5>
            {spec.details?.map((detail, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center">
                <p className={`mb-1 ${styles['j-publicFont']} `}>{detail.label}:</p>
                <p
                  className={`mb-1 ${styles['j-publicFont']} ${styles['j-detailContent']} text-end`}>
                  {toHalfWidth(detail.value || "無")}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
