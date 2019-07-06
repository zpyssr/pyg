package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(timeout = 5000)
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {
        //关键字空格处理
        String keywords = (String) searchMap.get("keywords");
        searchMap.put("keywords", keywords.replace(" ", ""));//将空格替换为空

        Map map = new HashMap<>();

        //高亮显示
        //1.追加到map集合
        map.putAll(searchList(searchMap));
        //2.分组查询商品分类列表
        List<String> categoryList = searchCategoryList(searchMap);
        map.put("categoryList", categoryList);
        //3.查询品牌和规格列表

        String category = (String) searchMap.get("category");
        if (!category.equals("")) {
            map.putAll(searchBrandAndSpecList(category));
        } else if (categoryList.size() > 0) {
            map.putAll(searchBrandAndSpecList(categoryList.get(0)));
        }
        return map;
    }

    @Override
    public void importList(List list) {
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    @Override
    public void deleteByGoodsIds(List goodsIdList) {
        System.out.println("删除商品");
        final Query query = new SimpleQuery();
        Criteria criteria = new Criteria("item_goodsid").in(goodsIdList);
        query.addCriteria(criteria);

        solrTemplate.delete(query);
        solrTemplate.commit();
    }

    //查询列表
    private Map searchList(Map searchMap) {
        Map map = new HashMap<>();
        //高亮显示初始化
        final HighlightQuery query = new SimpleHighlightQuery();
        final HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<em style='color:red'>");//前缀
        highlightOptions.setSimplePostfix("</em>");//后缀

        query.setHighlightOptions(highlightOptions);//未查询对象设置高亮选项
        //1.1关键字查询
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        //1.2按照商品分类进行过滤
        if (!"".equals(searchMap.get("category"))) {//如果用户选择了才进行筛选
            final FilterQuery filterQuery = new SimpleFilterQuery();
            final Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        //1.3按照品牌分类进行过滤
        if (!"".equals(searchMap.get("brand"))) {//如果用户选择了品牌才进行筛选
            final FilterQuery filterQuery = new SimpleFilterQuery();
            final Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            filterQuery.addCriteria(filterCriteria);
            query.addFilterQuery(filterQuery);
        }

        //1.4按照规格过滤
        if (searchMap.get("spec") != null) {
            Map<String, String> specMap = (Map<String, String>) searchMap.get("spec");
            for (String key : specMap.keySet()) {
                final FilterQuery filterQuery = new SimpleFilterQuery();
                final Criteria filterCriteria = new Criteria("item_spec_" + key).is(specMap.get(key));
                filterQuery.addCriteria(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }
        //1.5 按价格筛选
        if (!"".equals(searchMap.get("price"))) {
            String priceStr = (String) searchMap.get("price");
            String[] price = priceStr.split("-");
            if (!price[0].equals("0")) {//如果区间起点不等于0
                Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(price[0]);
                final FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
            if (!price[1].equals("*")) {//如果区间终点不等于*
                Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(price[1]);
                final FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }
        //1.6 分页查询
        Integer pageNo = (Integer) searchMap.get("pageNo");//提取页码
        if (pageNo == null) {
            pageNo = 1;//默认第一页
        }
        Integer pageSize = (Integer) searchMap.get("pageSize");//每页记录数
        if (pageSize == null) {
            pageSize = 20;//默认20项
        }
        query.setOffset((pageNo - 1) * pageSize);//从第几条记录查询
        query.setRows(pageSize);
        //1.7 排序
        String sortValue = (String) searchMap.get("sort");//ASC DESC
        String sortField = (String) searchMap.get("sortField");
        if (sortValue != null && !sortValue.equals("")) {
            if (sortValue.equals("ASC")) {
                Sort sort = new Sort(Sort.Direction.ASC, "item_" + sortField);
                query.addSort(sort);
            }
            if (sortValue.equals("DESC")) {
                Sort sort = new Sort(Sort.Direction.DESC, "item_" + sortField);
                query.addSort(sort);
            }

        }


        //************获取一个高亮结果集**************

        //高亮页
        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query, TbItem.class);

        //高亮入口集合
        List<HighlightEntry<TbItem>> entryList = page.getHighlighted();
        for (HighlightEntry<TbItem> entry : entryList) {
            //获取高亮列表
            List<HighlightEntry.Highlight> highlights = entry.getHighlights();
            /*for (HighlightEntry.Highlight h : highlights) {
                List<String> sns = h.getSnipplets();
                System.out.println(sns);
            }*/
            if (highlights.size() > 0 && highlights.get(0).getSnipplets().size() > 0) {
                TbItem item = entry.getEntity();
                item.setTitle(highlights.get(0).getSnipplets().get(0));
            }
        }
        map.put("rows", page.getContent());
        map.put("totalPages", page.getTotalPages());//返回总页数
        map.put("total", page.getTotalElements());//返回总记录数
        return map;
    }

    /**
     * 查询商品分类列表
     *
     * @return
     */
    private List<String> searchCategoryList(Map searchMap) {
        List<String> list = new ArrayList();
        final Query query = new SimpleQuery("*:*");
        //根据关键字查询 where
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));//where
        query.addCriteria(criteria);

        final GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");//group by
        query.setGroupOptions(groupOptions);
        //获得分组页
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //获取分组结果
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        //获取分组入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();
        //获取分组入口集合
        List<GroupEntry<TbItem>> entryList = groupEntries.getContent();
        for (GroupEntry<TbItem> entry : entryList) {
            //将分组的结果添加到返回值中
            list.add(entry.getGroupValue());
        }
        return list;
    }

    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 根据商品分类名称查询品牌和规格列表
     *
     * @param category 商品分类名称
     * @return
     */
    private Map searchBrandAndSpecList(String category) {
        Map map = new HashMap();
        //1.根据商品分类名称得到模板ID
        Long templateId = (Long) redisTemplate.boundHashOps("itemCat").get(category);
        if (templateId != null) {
            //2.根据模板ID获取品牌列表
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(templateId);
            map.put("brandList", brandList);
            System.out.println("品牌列表条数:" + brandList.size());
            //3.根据模板ID获取规格列表
            List specList = (List) redisTemplate.boundHashOps("specList").get(templateId);
            map.put("specList", specList);
            System.out.println("规格列表条数:" + specList.size());

        }
        return map;
    }
}
