package com.pinyougou.sellergoods.service;

import com.pinyougou.entity.PageResult;
import com.pinyougou.pojo.TbBrand;

import java.util.List;

/**
 * 品牌接口
 */
public interface BrandService {
    //返回全部列表
    public List<TbBrand> findAll();

    //总记录数
    /*
        {total:100,rows:[]} 后端返回的数据格式
        后端给前端的数据
            总记录数
            当前页记录数
        前端给后端的数据
            当前页
            每页记录数
     */

    /**
     * 品牌分页
     *
     * @param pageNum  当前页码
     * @param pageSize 每页记录数
     * @return
     */
    public PageResult findPage(int pageNum, int pageSize);

    /**
     * 增加品牌
     *
     * @param brand
     */
    public void add(TbBrand brand);

    /**
     * 根据id查询实体
     *
     * @param id
     * @return
     */
    public TbBrand findOne(Long id);

    /**
     * 修改品牌
     * @param brand
     */
    public void update(TbBrand brand);

    /**
     * 删除品牌
     * @param ids
     */
    public void delete(Long[] ids);
}
